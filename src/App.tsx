import Video_player from "./components/video-player";

function App() {
  // const handleUpload = () => {
  //   if (subtitleFile) {
  //     // Option 1: Read file as text
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       const content = e.target?.result as string;
  //       console.log("Subtitle content:", content);
  //       // Process the VTT content here
  //     };
  //     reader.readAsText(subtitleFile);

  //     // Option 2: Or create a URL to the file
  //     const fileURL = URL.createObjectURL(subtitleFile);
  //     console.log("Subtitle file URL:", fileURL);
  //     // You can use this URL with video track elements
  //   }
  // };

  return (
    <div className="text-center">
      <div className="w-full h-full ">
        <Video_player />
      </div>
      {/* subtittle upload section .vtt file */}
    </div>
  );
}

export default App;
