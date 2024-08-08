import "regenerator-runtime/runtime";
import React, { useCallback, useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "./App.css";

function App() {
  const [isActive, setIsActive] = useState(false);
  const [initialText, setInitialText] = useState("");
  const [blockUpdated, setBlockUpdated] = useState(null);
  const [blocks, setBlocks] = useState([]);
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
  // Start listening for speech recognition
  const startListening = useCallback(() => {
    SpeechRecognition.startListening({
      language: "en-US",
      continuous: true,
    });
  });

  useEffect(() => {
    startListening();
  }, [startListening]);

  const handleCommand = useCallback(() => {
    if (transcript) {
      // console.log(transcript);
      // regex to accurate the words
      const regexStop = new RegExp("stop", "i");
      const regexDelete = new RegExp("erase", "i");
      const regexCreate = new RegExp("open", "i");
      const regexChange = new RegExp("change", "i");

      // first if block stop transcripting
      // Stop listening and reset blocks
      if (regexStop.test(transcript)) {
        setIsActive(false);
        setBlockUpdated();
        setInitialText(""); // Clear the initial text when stopping
        setBlocks((prevState) =>
          prevState.map((block) => ({ ...block, isActive: false }))
        );
        resetTranscript();
        return;
      }

      // second if block erase transcripting
      // Erase text from the active block
      if (regexDelete.test(transcript)) {
        setInitialText("");
        setBlocks((prevState) =>
          prevState.map((block) => {
            if (block.id === blockUpdated) {
              return { ...block, text: "" };
            } else {
              return block;
            }
          })
        );
        resetTranscript();
        return;
      }

      // third if block -> set isActive on and set blockUpdated to the blockID
      // Activate a block based on the spoken keyword
      if (!isActive) {
        setBlocks((prevState) =>
          prevState.map((block) => {
            const regexStart = new RegExp(block.head, "i");
            if (regexStart.test(transcript)) {
              setIsActive(true);
              setBlockUpdated(block.id);
              setInitialText(block.text); // Save the initial text of the block
              block.isActive = true;
              resetTranscript();
            }
            return block;
          })
        );
      } else {
        // Append new transcript to the saved initial text
        setBlocks((prevBlocks) =>
          prevBlocks.map((block) => {
            if (block.id === blockUpdated) {
              if (regexChange.test(transcript)) {
                if (regexDelete.test(transcript)) {
                  resetTranscript();
                }

                return {
                  ...block,
                  head:
                    transcript === "change"
                      ? ""
                      : transcript.replace("change", ""), // change the head name to the new transcript
                };
              } else {
                return {
                  ...block,
                  text: `${initialText} ${transcript}`, // Append the new transcript to the initial text
                };
              }
            }
            return block;
          })
        );
      }

      if (regexCreate.test(transcript)) {
        console.log("speak now");
        setBlocks((prevState) => [
          ...prevState,
          {
            id: blocks.length + 1,
            head: "",
            isActive: true,
            text: "",
          },
        ]);
        resetTranscript();
        return;
      }
    }
  }, [transcript, isActive, blockUpdated, initialText, resetTranscript]);

  useEffect(() => {
    handleCommand();
  }, [handleCommand]);

  return (
    <>
      <p>Microphone: {listening ? "on" : "off"}</p>
      <div
        style={{
          display: "grid",
          gap: "16px",
          gridTemplateColumns: "repeat(auto-fit, minmax(1000px, 1fr))",
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
              <textarea
                value={block.text}
                readOnly
                style={{ width: "1000px" }}></textarea>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default App;
