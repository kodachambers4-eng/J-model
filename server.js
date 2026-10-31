const express = require('express');
const path = require('path');
const { DuckChat } = require('duckduckgo-ai-chat');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize a clean session with DuckDuckGo's default model (gpt-4o-mini / claude-3-haiku)
const chatClient = new DuckChat();

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message payload is required' });
    }

    // Set streaming headers so the browser receives text chunks word-by-word
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    try {
        // Stream responses directly out of DuckDuckGo's private cloud
        const stream = await chatClient.fetchResponseStream(message);
        
        for await (const chunk of stream) {
            if (chunk) {
                res.write(chunk);
            }
        }
        res.end();
    } catch (error) {
        console.error('DDG API error:', error);
        res.write(' [Error: Connection to Duck.ai timed out. Please try again.]');
        res.end();
    }
});

app.listen(PORT, () => {
    console.log(`🚀 J-Model Engine spinning up at: http://localhost:${PORT}`);
});
