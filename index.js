const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const collectBlock = require('mineflayer-collectblock').plugin;
const { GoogleGenAI } = require('@google/generative-ai');
const express = require('express');

// --- RENDER PORT BINDING (REQUIRED) ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Lofix Bot is alive and running safely!');
});

app.listen(PORT, () => {
  console.log(`Web server listening on port ${PORT} for Render compatibility.`);
});
// --------------------------------------

// 1. Gemini AI Configuration
const ai = new GoogleGenAI({ apiKey: "AIzaSyCUNDnJzF5P7-ebcWJHimo2LuDVlsz5MAM" });
const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

// 2. Minecraft Bot Configuration
const bot = mineflayer.createBot({
  host: 'smptisk.mcsh.io', 
  port: 25565,             
  username: 'lofix'        
});

bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);
bot.loadPlugin(collectBlock);

const BOT_PASSWORD = "LofixSecurePass123";

bot.on('spawn', () => {
  console.log("lofix has successfully connected to smptisk.mcsh.io!");
  
  const defaultMovements = new Movements(bot);
  bot.pathfinder.setMovements(defaultMovements);

  // 3. Automatic AuthMe Handling
  setTimeout(() => {
    bot.chat(`/register ${BOT_PASSWORD} ${BOT_PASSWORD}`);
    bot.chat(`/login ${BOT_PASSWORD}`);
  }, 2000);

  startHumanBehaviors();
});

// 4. Combat & Strict Revenge System
bot.on('entityHurt', (entity) => {
  if (entity === bot.entity) {
    const attacker = bot.pvp.getTarget();
    if (attacker && attacker.type === 'player') {
      bot.chat(`You messed with the wrong bot, ${attacker.username}!`);
      bot.pvp.attack(attacker); 
    }
  }
});

bot.on('entityDead', (entity) => {
  if (bot.pvp.target === entity) {
    bot.chat("Target eliminated successfully.");
    bot.pvp.stop();
    startHumanBehaviors(); 
  }
});

// 5. AI Chat System (Strict 20-word boundary)
bot.on('chat', async (username, message) => {
  if (username === bot.username) return; 

  const cleanMessage = message.toLowerCase();
  
  if (cleanMessage.includes('lofix')) {
    try {
      const aiPrompt = `You are a realistic human Minecraft player named lofix playing on a survival server. 
      A player named ${username} said: "${message}". 
      Respond to them naturally in English. 
      CRITICAL RULE: Your response MUST be extremely short. Absolute limit of 20 words. Do not under any circumstances exceed 20 words.`;
      
      const result = await model.generateContent(aiPrompt);
      let responseText = result.response.text().trim();
      
      const words = responseText.split(' ');
      if (words.length > 20) {
        responseText = words.slice(0, 20).join(' ');
      }

      bot.chat(responseText);
    } catch (error) {
      bot.chat("Lagging a bit, talk later.");
    }
  }
});

// 6. Lifelike Human Simulation
function startHumanBehaviors() {
  setInterval(() => {
    if (!bot.pvp.isAttacking && !bot.pathfinder.isMining()) {
      const rx = (Math.random() - 0.5) * 30;
      const rz = (Math.random() - 0.5) * 30;
      const targetLocation = bot.entity.position.offset(rx, 0, rz);
      
      bot.pathfinder.setGoal(new goals.GoalXZ(targetLocation.x, targetLocation.z));
    }
    
    if (bot.food < 15) {
      const foodItem = bot.inventory.items().find(item => item.name.includes('cooked') || item.name.includes('apple'));
      if (foodItem) {
        bot.equip(foodItem, 'hand');
        bot.consume();
      }
    }
  }, 12000); 
    }
