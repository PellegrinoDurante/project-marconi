const MediaServer = require("node-media-server");

function startServer(
  onStreamStarted = () => {},
  onStreamStopped = () => {}
) {
  const mediaServer = new MediaServer({
    logType: 1,
    rtmp: {
      port: 1935,
      chunk_size: 60000,
      gop_cache: true,
      ping: 30,
      ping_timeout: 60,
    },
    http: {
      port: 8000,
      allow_origin: "*",
    },
  });

  mediaServer.on("postPublish", (id, StreamPath, args) => {
    onStreamStarted(StreamPath);
  });

  mediaServer.on("donePublish", (id, StreamPath, args) => {
    onStreamStopped(StreamPath);
  });

  mediaServer.run();

  return mediaServer;
}

module.exports.startServer = startServer;
