import React, { useState, useRef } from "react";
import "audio-recorder-polyfill";
import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";
import { Button } from "@material-tailwind/react";
import { FaMicrophone, FaStop } from "react-icons/fa";

const AudioRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileCounterRef = useRef(1);

  const startRecording = async () => {
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "audio/webm",
    });

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const wavBlob = await convertToWav(audioBlob);
      const audioURL = URL.createObjectURL(wavBlob);
      setAudioURL(audioURL);
      audioChunksRef.current = [];

      const fileName = `grabacionwav${fileCounterRef.current}.wav`;
      fileCounterRef.current += 1;

      await uploadToS3(wavBlob, fileName);
    };

    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current.stop();
  };

  const downloadAudio = () => {
    const a = document.createElement("a");
    a.href = audioURL;
    a.download = "grabacionwav.wav";
    a.click();
  };

  const convertToWav = (webmBlob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(webmBlob);
      reader.onloadend = () => {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        audioContext.decodeAudioData(reader.result, (buffer) => {
          const wavBlob = bufferToWave(buffer, buffer.length);
          resolve(wavBlob);
        });
      };
    });
  };

  const bufferToWave = (abuffer, len) => {
    const numOfChan = abuffer.numberOfChannels;
    const length = len * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let sample;
    let offset = 0;
    let pos = 0;

    setUint32(0x46464952);
    setUint32(length - 8);
    setUint32(0x45564157);

    setUint32(0x20746d66);
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);

    setUint32(0x61746164);
    setUint32(length - pos - 4);

    for (let i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([buffer], { type: "audio/wav" });

    function setUint16(data) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  };

  const uploadToS3 = async (blob, fileName) => {
    try {
      const target = {
        Bucket: "iuc-historia-clinica-private-dev",
        Key: `raw_audios/${fileName}`,
        Body: blob,
      };
      const creds = {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
      };
      const parallelUploads3 = new Upload({
        client: new S3Client({ region: "us-east-1", credentials: creds }),
        params: target,
      });
      parallelUploads3.on("httpUploadProgress", (progress) => {
        console.log(progress);
      });
      await parallelUploads3.done();
      console.log("Upload completed successfully");
    } catch (e) {
      console.error("Error uploading to S3", e);
    }
  };

  return (
    <div>
      <div
        className="icon-container"
        onClick={recording ? stopRecording : startRecording}
      >
        {recording ? <FaStop size={100} /> : <FaMicrophone size={100} />}
      </div>
      {audioURL && (
        <div>
          <audio className="mt-3" src={audioURL} controls />
          <Button color="green" onClick={downloadAudio}>
            Descargar
          </Button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
