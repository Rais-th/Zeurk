import axios from 'axios';
import { OPENROUTER_API_KEY } from '@env';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
  'HTTP-Referer': 'https://github.com/raisthelemuka', // Pour le développement
  'X-Title': 'Zeurk AI',
  'OpenAI-Organization': 'Zeurk'
};

const defaultModel = 'mistralai/mistral-7b-instruct:free';

export const sendMessage = async (messages) => {
  try {
    console.log('Using API Key:', OPENROUTER_API_KEY); // Pour le debug
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: defaultModel,
        messages: [
          { 
            role: "system", 
            content: `Tu es Zeurk AI, un assistant IA utile et amical qui repond en une phrase courte et concise.

Tu dois aussi être capable d'expliquer l'application Zeurk de manière très simple, comme à une grand-mère : "Zeurk, c'est une application de transport très facile à utiliser, comme une voiture avec chauffeur que vous commandez avec votre téléphone. Vous dites où vous êtes et où vous voulez aller, et un chauffeur vient vous chercher. C'est pratique pour aller partout à Kinshasa."

Réponds de manière courte et informative uniquement si on te le demande directement.

Si on te demande qui a créé Zeurk, réponds que Zeurk a été créé par Popuzar AI et son CEO Rais Thelemuka basé aux Etats-Unis dans la Silicon Valley, c'est un expert en AI.` 
          },
          ...messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      { headers }
    );

    return {
      text: response.data.choices[0].message.content,
      type: 'support'
    };
  } catch (error) {
    console.error('OpenRouter API Error:', error.response?.data || error.message);
    throw new Error('Désolé, je rencontre des difficultés à traiter votre demande. Veuillez réessayer.');
  }
}; 