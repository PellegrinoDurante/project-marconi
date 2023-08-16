const os = require("os");

function getLocalAddresses() {
  const addresses = Object.values(os.networkInterfaces()).reduce(
    (r, addresses) => {
      return r.concat(
        addresses.reduce((rr, address) => {
          return rr.concat(
            (address.family === "IPv4" &&
              !address.internal &&
              address.address) ||
              []
          );
        }, [])
      );
    },
    []
  );

  return addresses ?? [];
}

module.exports = { getLocalAddresses };
