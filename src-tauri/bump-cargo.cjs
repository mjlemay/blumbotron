module.exports.readVersion = function (contents) {
  const match = contents.match(/^\s*version\s*=\s*"([^"]+)"/m);
  return match ? match[1] : undefined;
};

module.exports.writeVersion = function (contents, version) {
  return contents.replace(
    /^(\s*version\s*=\s*")([^"]+)(")/m,
    `$1${version}$3`
  );
};
