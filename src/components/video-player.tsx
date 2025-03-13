import { Component, createRef, RefObject } from "react";
import API from "../api/api";
import ReactPlayer from "react-player";

// Define interfaces for props and state
interface VideoPlayerProps {}

interface VideoPlayerState {
  videoUrl: string;
  playing: boolean;
  controls: boolean;
  muted: boolean;
  lastKnownPosition: number; //  track last position
  lastProgressUpdate: number; // timestamp
  subtitleTracks: {
    kind: string;
    srcLang: string;
    src: string;
    default: boolean;
    mode: string;
    label: string;
  }[];
}

class Video_player extends Component<VideoPlayerProps, VideoPlayerState> {
  private playerRef: RefObject<ReactPlayer>;
  private inputRef: RefObject<HTMLInputElement>;
  private api: API | null = null;
  private ready: boolean = false;

  constructor(props: VideoPlayerProps) {
    super(props);
    this.state = {
      videoUrl: "",
      playing: false,
      controls: true,
      muted: true,
      lastKnownPosition: 0,
      lastProgressUpdate: Date.now(),
      subtitleTracks: [],
    };

    // Initialize refs
    this.playerRef = createRef<ReactPlayer>();
    this.inputRef = createRef<HTMLInputElement>();
  }

  componentDidMount(): void {
    // Initialize API after component is mounted
    this.api = new API(
      this.playerRef,
      this.play_vid,
      this.pause_vid,
      this.seek_vid,
      this.handleVideoUrl,
      this.set_subtitle_link
    );
  }

  play_vid = (): void => {
    this.setState({ playing: true });
  };

  pause_vid = (): void => {
    this.setState({ playing: false });
  };

  seek_vid = (position: number): void => {
    if (this.ready) {
      // Player is ready, seek immediately
      this.playerRef.current?.seekTo(position);
    } else {
      // Store the position we want to seek to
      const targetPosition = position;

      // Set up a function to check readiness and seek
      const checkAndSeek = () => {
        if (this.ready) {
          this.playerRef.current?.seekTo(targetPosition);
        } else {
          // Still not ready, check again in 100ms
          setTimeout(checkAndSeek, 100);
        }
      };

      // Start checking
      setTimeout(checkAndSeek, 100);
    }
  };
  set_subtitle_link = (link: string) => {
    this.setState({
      subtitleTracks: [
        {
          kind: "subtitles",
          src: link,
          srcLang: "en",
          default: true,
          mode: "showing",
          label: "English",
        },
      ],
    });
  };

  handleVideoUrl = (url: string): void => {
    this.setState({ videoUrl: url });
  };

  handleSetVideo = async () => {
    if (!this.api) return;
    const mediaValue = this.inputRef.current?.value.trim() || "";
    this.api.setMediaSrc(mediaValue);
  };

  handlePlay = (): void => {
    if (this.api) this.api.play();
  };

  handlePause = (): void => {
    if (this.api) this.api.pause();
  };

  handleSeek = (position: number): void => {
    if (
      this.state.lastKnownPosition === position ||
      Date.now() - this.state.lastProgressUpdate < 2000
    ) {
      // ignore seek event if is already equal to the last known position
      return;
    }
    // console.log(" seek event", {
    //   lastProgressUpdate: this.state.lastProgressUpdate,
    //   now: Date.now(),
    //   difference: Date.now() - this.state.lastProgressUpdate,
    // });

    if (this.api) {
      this.handlePause();
      this.api.seek(position);
      this.handlePlay();
      // Update last known position when normal seeking happens
      this.setState({
        lastKnownPosition: position,
        lastProgressUpdate: Date.now(),
      });
    }
  };

  handleProgress = (state: {
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
    played: number;
  }) => {
    if (state.playedSeconds === this.state.lastKnownPosition) {
      // ignore progress event if is already equal to the last known position
      return;
    }
    // seek detection threshold
    const seekThreshold = 2;

    // time since last update in seconds
    const now = Date.now();
    const timeSinceLastUpdate = (now - this.state.lastProgressUpdate) / 1000;

    //Detect jump in position
    if (
      Math.abs(state.playedSeconds - this.state.lastKnownPosition) >
        seekThreshold &&
      Math.abs(state.playedSeconds - this.state.lastKnownPosition) >
        timeSinceLastUpdate * 1.5
    ) {
      if (this.api) {
        this.api.seek(state.playedSeconds);
      }
    }

    // Update position
    this.setState({
      lastKnownPosition: state.playedSeconds,
      lastProgressUpdate: now,
    });
  };
  handleSubtitleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const subtitleFile = event.target.files[0];

      try {
        // Make sure the API is initialized
        if (!this.api) {
          console.error("API not initialized");
          return;
        }
        console.log("Uploading subtitles:", API.fromServer);
        // Call the API method to add subtitles
        const result = await this.api.add_subtitles(subtitleFile);
        API.fromServer = false;
        console.log("Subtitles upload result:", result);
      } catch (error) {
        console.error("Error uploading subtitles:", error);
      } finally {
        console.log("Finally block", API.fromServer);
        // Always call get_subtitles_link, even if there was an error
        this.api?.get_subtitles_link();
      }
    }
  };
  render = () => {
    const { videoUrl, playing, controls, muted, subtitleTracks } = this.state;
    const config = {
      file: {
        attributes: {
          crossOrigin: "true",
        },
        tracks: subtitleTracks,
      },
    };
    return (
      <div>
        <div className="py-4 flex flex-row justify-center items-center">
          <div className="inline">
            <input
              type="text"
              placeholder="Enter video URL"
              className="input input-bordered input-error w-full max-w-xs"
              ref={this.inputRef}
            />
          </div>
          <div className="inline-block px-4">
            <button className="btn btn-primary" onClick={this.handleSetVideo}>
              Set video
            </button>
          </div>
          <div></div>
        </div>
        <div>
          <ReactPlayer
            muted={muted}
            url={videoUrl}
            controls={controls}
            playing={playing}
            ref={this.playerRef}
            onPlay={this.handlePlay}
            onPause={this.handlePause}
            onSeek={this.handleSeek}
            onProgress={this.handleProgress}
            onReady={() => {
              this.ready = true;
            }}
            width="100%"
            height="auto"
            config={{
              file: config.file,
            }}
          />
        </div>
        <div className="inline">
          <input
            type="file"
            className="input input-bordered input-error w-full max-w-xs"
            accept=".vtt"
            onChange={this.handleSubtitleUpload}
          />
        </div>
      </div>
    );
  };
}

export default Video_player;
