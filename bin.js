#!/usr/bin/env node

const axios = require("axios");
var url = require("url");
const { program } = require("commander");
const { getLocalAddresses } = require("./utils");
const { startServer: startDnsServer } = require("./dns");
const { startServer: startMediaServer } = require("./media");

program
  .name("console-stream-proxy-cli")
  .description(
    "Starts a DNS server and a media server to proxy your console stream through your computer, \
    allowing to use softwares like OBS to edit the feed before streaming it to Twitch."
  )
  .version("1.0.0")

  .option("-l, --local-address <ip>", "Local IP address to use (usually 192.168.1.x)")
  .option("-p, --public-address <ip>", "Public IP address to use")
  .option("-i, --ingest-hosts <hosts...>", "Ingest hosts to intercept")

  .action(async (options) => {
    let localAddress = options.localAddress;
    let publicAddress = options.publicAddress;
    let ingestHosts = options.ingestHosts;

    // Check local address
    if (!localAddress) {
      const localAddresses = getLocalAddresses();

      if (localAddresses.length === 0) {
        throw new Error("Unable to get local IP address");
      }

      localAddress = localAddresses[0];
      console.log(
        `⚠ You did not provide a local IP address. I detected and now using this: ${localAddress}`
      );
    }

    // Check public address
    if (!publicAddress) {
      try {
        publicAddress = await (await axios.get("https://api.ipify.org")).data;
      } catch {
        console.log(
          "⚠ I can't detect your public IP address! If you plan to use this tool with consoles outside your local network, the public IP address is required to work properly."
        );
      }
    }

    // Check ingestHosts
    if (!options.ingestHosts) {
      try {
        const data = await (
          await axios.get("https://ingest.twitch.tv/ingests")
        ).data;

        ingestHosts = data.ingests
          .map((ingest) => ingest.url_template)
          .map((ingest) => new URL(ingest).hostname);
      } catch {
        console.log(
          "⚠ I can't automatically retrieve Twitch's ingest hosts! Please provide them explicitly via --ingest-hosts option."
        );
        process.exit();
      }
    }

    let dnsServer, mediaServer;
    let dnsStatus = false;
    let mediaStatus = false;

    function checkStatus() {
      if (dnsStatus && mediaStatus) {
        console.log("ℹ You can see a preview of your streams on http://localhost:8000/admin/streams");
        console.log("⏳ Waiting for streams...");
      }
    }

    function quit(error) {
      if (dnsServer) {
        for (key in dnsServer.servers) {
          dnsServer.servers[key].close();
        }
      }

      if (mediaServer) {
        mediaServer.stop();
      }

      console.log("Exiting with error: " + error);
      process.exit();
    }

    try {
      dnsServer = await startDnsServer(
        { localAddress, publicAddress, ingestHosts },
        {
          error: (error) => {
            dnsStatus = false;
            quit(error);
          },
          listening: (addresses) => {
            dnsStatus = true;
            checkStatus();
          },
        }
      );

      mediaServer = startMediaServer(
        (streamPath) => console.log(`🚀 Stream started: rtmp://127.0.0.1${streamPath}`),
        (streamPath) => console.log(`😢 Stream ended: rtmp://127.0.0.1${streamPath}`)
      );

      mediaStatus = true;
      checkStatus();
    } catch (e) {
      quit(e);
    }
  });

program.parse();
