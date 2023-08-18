# Project Marconi
A simple DNS and media server which allow you to stream from your console to your computer.

## 💡 Why?
Project Marconi was created to solve a basic problem: how can I personalize my streaming when using a console? The easiest solution is to buy a capture card. But what if I can't afford one right now? And what if I want to put together two different streams - one from me and one from a friend in a different place - into just one stream?

This tool helps with that. But remember, Project Marconi is really simple in its idea. It doesn't only focus on the examples just mentioned. 

## ⚙ How?
Project Marconi is made up of two parts:
- a DNS server: this intercepts the DNS lookup requests for the streaming provider host. This make sure that the actual streaming requests will be sent to itself, pretending to be the streaming provider;
- a RTMP media server: this ingests the streams and lets you access them on your own computer (using something like OBS, for example).

## ⬇ Download
You can find the standalone executables for Linux, MacOS and Windows [here](https://github.com/PellegrinoDurante/project-marconi/releases/latest) or in the Releases page.

## 🚀 Usage
### Step 1 - Start Project Marconi
Under normal scenarios, using Project Marconi is as simple as launching the executable.  
But in some cases (e.g. multiple network adapters, VPN softwares, Docker, WSL, etc.) you should override the assumptions made by the tool.

It accepts the following options:
- `-l, --local-address <ip>`: Local IP address to use (usually 192.168.1.x). This will be the DNS address to eventually use on your console. If you have softwares for VPN, Docker, WSL, virtual machines, etc, your computer potentially have more than one local address so it can't be automatically detected.
- `-p, --public-address <ip>`: Public IP address to use. This should always be detected automatically. If you see an error (maybe due to a firewall or similar given that the public IP is retrieved with a request to https://api.ipify.org) you can manually pass it with this option.
- `-i, --ingest-hosts <hosts...>`: Ingest hosts to intercept. If this option is not given, Project Marconi automatically retrieve your list of ingest hosts from https://ingest.twitch.tv/ingests. If it does not detect your stream, maybe your console is using a different ingest host - see WIP.

### Step 2 - Change your console's DNS
You have to change your primary and secondary DNS with:
- local IP address of the computer Project Marconi is running on - if your console is connected to the same network of the same computer;
- public IP address of the computer Project Marconi is running on - if your console is outside your local network (however to make this work you have to configure ports forwarding as described in WIP).

### Step 3 - Start the stream
You can now start a new stream from your console and you should see a message in Project Marconi confirming that a new stream is detected.
In that moment you aren't actually streaming on your streaming provider (e.g. Twitch); you could now use your local stream as a source in OBS and start a new streaming from within it.
  
At http://localhost:8000/admin/streams it is possible to see a preview of the currently active streams.  
  
When a new stream starts, you will see in the terminal a local RTMP URI (like `rtmp://127.0.0.1/app/live_***`). You can use this inside a streaming software like OBS as a new source.  
  
⚠ **Disclaimer**: This URI can contain your PRIVATE stream key and you should keep this secret. Anyone with your stream key can stream on your channel on your behalf. Project Marconi do NOT save or send your stream key!

## ❕ Important informations
Currently only Twitch is officially supported for the automatic ingest URL detection. However it *probably* works passing the ingest hosts manually.

## ❓ Frequently Asked Questions
WIP
