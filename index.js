const forge = require("node-forge")
const express = require("express")
const fs = require("fs")
const path = require("path")

const privateKeyPem = fs.readFileSync(path.join(process.cwd(), "./keypair/.private_key.pem"))
const publicKeyPem = fs.readFileSync(path.join(process.cwd(), "./keypair/.public_key.pem"))
const keyPairId = fs.readFileSync(path.join(process.cwd(), "./keypair/.key_pair_id.txt"))

// Global Config
const xmlMissingKeyPair = `<?xml version="1.0" encoding="UTF-8"?><Error><Code>MissingKey</Code><Message>Missing Key-Pair-Id parameter or cookie value</Message></Error>`
const xmlNotFound = `<?xml version="1.0" encoding="UTF-8"?><Error><Code>NotFound</Code><Message>Page Not Found</Message></Error>`
const xmlSignatureInvalid = `<?xml version="1.0" encoding="UTF-8"?><Error><Code>InvalidSignature</Code><Message>Invalid Signature</Message></Error>`
const xmlInvalidKeyId = `<?xml version="1.0" encoding="UTF-8"?><Error><Code>InvalidKeyId</Code><Message>Invalid Key Id</Message></Error>`

// Some Function
const createSignature = async (data) => {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)
  const md = forge.md.sha256.create()
  md.update(data.file, "utf8")
  md.update(data.expired_at.toString(), "utf8")
  const signature = privateKey.sign(md)
  return forge.util.encode64(signature)
}
const verifySignature = async (data, signature) => {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem)
  const md = forge.md.sha256.create()
  md.update(data.file, "utf8")
  md.update(data.expired_at.toString(), "utf8")
  const digest = md.digest().getBytes()
  const isValid = publicKey.verify(digest, forge.util.decode64(signature))
  return isValid
}
const generateSignedUrl = async (url) => {
  const currentDate = new Date()
  const expiredAt = new Date(currentDate.getTime() + (60 * 60 * 1000))
  const dataName = url.split("/").at(-1)
  const data = { file: dataName, expired_at : expiredAt.getTime() }
  const signData = await createSignature(data)
  return url + "?Expires=" + expiredAt.getTime() + "&Signature=" + encodeURIComponent(signData) + "&Key-Pair-Id=" + keyPairId
}

const app = express()
app.use(express.urlencoded({extended: true }))
app.use(express.json())

// Verify Signed Url
const streamSignedMedia = async (req, res, next, folderId) => {
 try {
    if (req.query["Expires"] && req.query["Signature"] && req.query["Key-Pair-Id"]) {
      const data = { file : req.params.nameMedia, expired_at : Number(req.query["Expires"])}
      const verify = await verifySignature(data, decodeURIComponent(req.query["Signature"]))
      if (verify && Date.now() < req.query["Expires"] && req.query["Key-Pair-Id"] == keyPairId) {
        const fileData = fs.createReadStream(path.join(process.cwd(), "./images.jpg"))
        if (fileData) {
          res.status(200).type("images/jpg")
          fileData.pipe(res)
        } else { res.status(404).type('application/xml').send(xmlNotFound) } 
      } 
      else if (!verify) { res.status(401).type('application/xml').send(xmlSignatureInvalid) }
      else if (req.query["Key-Pair-Id"] != keyPairId) { res.status(403).type('application/xml').send(xmlInvalidKeyId) }
      else { res.status(404).type('application/xml').send(xmlNotFound) }
    } 
    else if (!req.query["Signature"] || !req.query["Key-Pair-Id"]) { res.status(401).type('application/xml').send(xmlMissingKeyPair) }
    else { res.status(404).type('application/xml').send(xmlNotFound) }
  } catch (err) { console.log(err); res.status(404).type('application/xml').send(xmlNotFound) }
}
app.get("/:nameMedia", async (req, res, next) => {
  await streamSignedMedia(req, res, next)
})

// Generate Signed Url
app.post("/signurl", async (req, res, next) => {
  // Sample Url/req.body.url = http://localhost:3000/images.jpg
  // The data.file will be images.jpg
  const url = req.body.url
  const signedUrl = await generateSignedUrl(url)
  res.send(signedUrl)
})

app.listen(3500, () => {
  console.log("Server is Running")
})
