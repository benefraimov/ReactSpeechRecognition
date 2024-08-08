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
              return {
                ...block,
                text: `${initialText} ${transcript}`, // Append the new transcript to the initial text
              };
            }
            return block;
          })
        );
      }
    }
  }, [transcript, isActive, blockUpdated, initialText, resetTranscript]);

  useEffect(() => {
    handleCommand();
  }, [handleCommand]);

  return (
    <>
      <p>Microphone: {listening ? "on" : "off"}</p>
      <p>{transcript}</p>
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
