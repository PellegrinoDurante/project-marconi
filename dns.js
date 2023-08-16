const dns2 = require("dns2");
const { Packet } = dns2;
const resolve = dns2.UDPClient();

function isPrivateIP(ip) {
  var parts = ip.split(".");
  return (
    parts[0] === "10" ||
    (parts[0] === "172" &&
      parseInt(parts[1], 10) >= 16 &&
      parseInt(parts[1], 10) <= 31) ||
    (parts[0] === "192" && parts[1] === "168")
  );
}

async function startServer(
  { localAddress, publicAddress = "", ingestHosts = [] },
  callbacks = {}
) {
  const dnsServer = dns2.createServer({
    udp: true,
    handle: async (request, send, rinfo) => {
      const response = Packet.createResponseFromRequest(request);
      const [question] = request.questions;
      const { name } = question;

      // Check if DNS request should be intercepted and send response with this host's address
      if (ingestHosts.includes(name)) {
        response.answers.push({
          name,
          type: Packet.TYPE.A,
          class: Packet.CLASS.IN,
          ttl: 300,
          address: isPrivateIP(rinfo.address) ? localAddress : publicAddress,
        });
        send(response);
      } else {
        const { answers } = await resolve(name);
        response.answers.push(...answers);
        send(response);
      }
    },
  });

  if (callbacks.error) {
    dnsServer.on("error", callbacks.error);
  }

  if (callbacks.request) {
    dnsServer.on("request", callbacks.request);
  }

  if (callbacks.requestError) {
    dnsServer.on("requestError", callbacks.requestError);
  }

  if (callbacks.listening) {
    dnsServer.on("listening", callbacks.listening);
  }

  dnsServer.listen({
    udp: {
      port: 53,
      address: "0.0.0.0",
      type: "udp4",
    },
  });

  return dnsServer;
}

module.exports = { startServer };
