import "regenerator-runtime/runtime";
import React, { useCallback, useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "./App.css";

function App() {
  const [isActive, setIsActive] = useState(false);
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState("");
  const [blockUpdated, setBlockUpdated] = useState();
  const [blocks, setBlocks] = useState([
    { id: "1", head: "apple", isActive: false, text: "this is test 1" },
    { id: "2", head: "black", isActive: false, text: "this is test 2" },
    { id: "3", head: "white", isActive: false, text: "this is test 3" },
  ]);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <span>Brwser doesn't support speech recognition.</span>;
  }

  // first use effect to listen to alanguage
  const startListening = useCallback(() => {
    SpeechRecognition.startListening({
      language: "en-US",
    });
  });

  useEffect(() => {
    startListening();
  }, [startListening]);

  const onListening = useCallback(() => {
    if (transcript) {
      // console.log(transcript);
      // regex to accurate the words
      const regexStop = new RegExp("stop", "i");
      const regexDelete = new RegExp("erase", "i");
      // first if block stop transcripting
      if (regexStop.test(transcript)) {
        setIsActive(false);
        setBlockUpdated();
        setBlocks((prevState) => {
          return prevState.map((block) => {
            return { ...block, isActive: false };
          });
        });
      }
      // second if block erase transcripting
      if (regexDelete.test(transcript)) {
        setBlocks((prevState) => {
          return prevState.map((block) => {
            if (block.id === blockUpdated) {
              return { ...block, text: "" };
            } else {
              return block;
            }
          });
        });
      }
      // third if block -> set isActive on and set blockUpdated to the blockID
      if (!isActive) {
        setBlocks((prevState) => {
          return prevState.map((block) => {
            const regexStart = new RegExp(block.head, "i");
            if (regexStart.test(transcript)) {
              block.isActive = true;
              // console.log(transcript);
              // console.log("wow");
              setIsActive(true);
              setBlockUpdated(block.id);
            }
            return block;
          });
        });
      }
      // fourth if block -> transcripting to the blocks
      if (isActive) {
        // console.log(transcript);
        if (transcript !== lastProcessedTranscript) {
          setBlocks((prevBlocks) => {
            return prevBlocks.map((block) => {
              if (block.id === blockUpdated) {
                console.log(transcript);
                const newText = transcript
                  .replace(lastProcessedTranscript, "")
                  .trim();
                return { ...block, text: (block.text || "") + " " + newText };
              } else {
                return block;
              }
            });
          });
          setLastProcessedTranscript(transcript);
        }
      }
    }
  }, [transcript]);

  useEffect(() => {
    onListening();
  }, [onListening]);

  // useEffect(() => {
  //   console.log(blocks);
  // }, [blocks]);

  return (
    <>
      <p>Microphone: {listening ? "on" : "off"}</p>
      <div
        style={{
          display: "grid",
          gap: "16px",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        }}>
        {blocks.map((block) => {
          return (
            <div
              style={
                block.isActive
                  ? {
                      border: "4px solid green",
                    }
                  : {
                      border: "4px solid red",
                    }
              }
              key={block.id}>
              <h1>{block.head}</h1>
              <textarea value={block.text} readOnly></textarea>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default App;
