const Jimp = require("jimp");
const path=require("path")

const GS10formPicSaveAndSetup = async (imageSelct,type) => {

    // image setup compression
    const buffer = Buffer.from(imageSelct.replace(/^data:image\/(jpg|jpeg|png);base64,/, ''), 'base64');
    const imageName = `image_${Date.now()}-${Math.round(
        Math.random() * 1e9 //ye million hai
    )}.png`

    const jimpResp = await Jimp.read(buffer);
    if (type === 'Gs10Form') {
        jimpResp.resize(550, Jimp.AUTO).write(path.resolve(__dirname, `../Storage/Forms/${imageName}`))
    }


    return imageName;
}

module.exports = GS10formPicSaveAndSetup;