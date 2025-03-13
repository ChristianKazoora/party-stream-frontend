import React from "react";
import {
  BACKEND_ADDRESS,
  BACKEND_WEBSOCKET_ADDRESS,
} from "../constants/constants";
import ReactPlayer from "react-player";
const fullLink = BACKEND_ADDRESS;
class API {
  playerRef: React.RefObject<ReactPlayer>;
  ws: WebSocket;
  playerID: string;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (position: number) => void;
  handleVideoUrl: (url: string) => void;
  set_subtitle_link: (url: string) => void;
  static fromServer: boolean = false;
  constructor(
    playerRef: React.RefObject<ReactPlayer>,
    onPlay: () => void,
    onPause: () => void,
    onSeek: (position: number) => void,
    handleVideoUrl: (url: string) => void,
    set_subtitle_link: (url: string) => void
  ) {
    this.playerRef = playerRef;
    this.playerID = "";
    this.onPlay = onPlay;
    this.onPause = onPause;
    this.onSeek = onSeek;
    this.handleVideoUrl = handleVideoUrl;
    this.set_subtitle_link = set_subtitle_link;
    this.ws = new WebSocket(BACKEND_WEBSOCKET_ADDRESS);
    API.fromServer = false;
    this.ws.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    this.ws.onmessage = (event) => {
      console.log("Received message from server:", event.data);
      const parsedMessage = JSON.parse(event.data);
      if (parsedMessage.id === this.playerID || parsedMessage.ttl === 0) {
        return;
      }
      if (parsedMessage.type === "seek") {
        API.fromServer = true;
        const currentTime = this.playerRef.current?.getCurrentTime?.() ?? 0;
        if (Math.abs(parsedMessage.position - currentTime) > 0.1) {
          this.onSeek(parsedMessage.position);
        }
      } else if (parsedMessage.type === "play") {
        API.fromServer = true;
        if (this.playerRef.current) {
          this.onPlay();
        }
      } else if (parsedMessage.type === "pause") {
        API.fromServer = true;
        if (this.playerRef.current) {
          this.onPause();
        }
      } else if (parsedMessage.type === "link") {
        this.handleVideoUrl(parsedMessage.link);
      } else if (parsedMessage.type === "subtitles") {
        API.fromServer = true;
        this.set_subtitle_link(parsedMessage.link);
      } else if (parsedMessage.type === "connection") {
        API.fromServer = true;
        this.playerID = parsedMessage.id;
        this.onSeek(parsedMessage.currentPosition);
        this.handleVideoUrl(parsedMessage.currentLink);
        parsedMessage?.isPlaying === true ? this.onPlay() : this.onPause();
        this.set_subtitle_link(parsedMessage.subtitleLink);
      }
    };

    this.ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  setMediaSrc = async (src: string) => {
    this.ws.send(
      JSON.stringify({
        type: "link",
        link: src,
        id: this.playerID,
      })
    );
  };

  play = async () => {
    if (API.fromServer) {
      API.fromServer = false;
    } else {
      this.ws.send(
        JSON.stringify({
          type: "play",
          id: this.playerID,
        })
      );
    }
  };
  pause = async () => {
    if (API.fromServer) {
      API.fromServer = false;
    } else {
      this.ws.send(
        JSON.stringify({
          type: "pause",
          id: this.playerID,
        })
      );
    }
  };
  seek = async (position: number) => {
    if (API.fromServer) {
      API.fromServer = false;
    } else {
      this.ws.send(
        JSON.stringify({
          type: "seek",
          position,
          id: this.playerID,
        })
      );
    }
  };
  get_subtitles_link = async () => {
    console.log("Getting subtitles link", API.fromServer);
    if (API.fromServer) {
      API.fromServer = false;
    } else {
      console.log("Sending request for subtitles link");
      this.ws.send(
        JSON.stringify({
          type: "subtitles",
          id: this.playerID,
        })
      );
    }
  };
  add_subtitles = async (file: File) => {
    const fileContent = await file.text();

    const response = await fetch(`${fullLink}/add-subtitles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subtitle: fileContent }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload subtitles: ${errorText}`);
    }
    return response.status;
  };
}

export default API;
