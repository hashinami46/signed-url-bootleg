const forge = require("node-forge")
const fs = require("fs")

const generateKeyPair = () => {
  const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
  const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
  const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);
  return { privateKeyPem, publicKeyPem };
};
const generateKeyPairId = (publicKeyPem) => {
  const md = forge.md.sha256.create();
  md.update(publicKeyPem);
  const keyPairId = md.digest().toHex();
  return keyPairId;
};
const generateUniqueId = (hashValue) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let uniqueId = "";
  for (let i = 0; i < 14; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniqueId += characters[randomIndex];
  };
  return uniqueId;
};

const { privateKeyPem, publicKeyPem } = generateKeyPair();
const keyPairIdHash = generateKeyPairId(publicKeyPem);
const keyPairId = generateUniqueId(keyPairIdHash)

console.log("Private Key PEM:", privateKeyPem);
console.log("Public Key PEM:", publicKeyPem);
console.log("Key Pair ID:", keyPairId);

fs.writeFile("./keypair/.private_key.pem", privateKeyPem, (err) => { if (err) {console.log(err)} else {console.log("Your Private Key saved at ./keypair/.private_key.pem")}})
fs.writeFile("./keypair/.public_key.pem", publicKeyPem, (err) => { if (err) {console.log(err)} else {console.log("Your Public Key saved at ./keypair/.public_key.pem")}})
fs.writeFile("./keypair/.key_pair_id.txt", keyPairId, (err) => { if (err) {console.log(err)} else {console.log("Your Key-Pair-Id saved at ./keypair/.key_pair_id.txt")}})