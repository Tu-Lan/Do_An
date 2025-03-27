import axios from 'axios';

export const translateText = async (req, res) => {
  const { text, targetLang } = req.body;

  try {
    const response = await axios.post('https://translation.googleapis.com/language/translate/v2', {
      q: text,
      target: targetLang,
      key: process.env.GOOGLE_TRANSLATE_API_KEY,
    });

    res.json({ success: true, translatedText: response.data.data.translations[0].translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ success: false, message: 'Translation failed' });
  }
};