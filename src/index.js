#!/usr/bin/env node
import fs from 'fs'
import { dramaticify } from './prompts.js'
// import OpenAI, { Configuration, OpenAIApi } from 'openai'
import axios from 'axios'

// Load your changelog input from a text file of stdin
const input = process.argv[2]
if (!input) {
    console.error("Please provide a changelog entry")
    process.exit(1)
}

async function generateDramaticLog(text) {
    const prompt = dramaticify(text);

    try {
        const res = await axios.post('http://localhost:11434/api/chat', {
            model: 'llama3:instruct',
            messages: [
                { role: 'system', content: 'You are Changelog Bard, an overly dramatic AI poet and playwright.' },
                { role: 'user', content: prompt },
            ],
            stream: false
        }, {
            timeout: 240000
        });
        
        const output = res.data.message?.content?.trim();
        if (!output) throw new Error('Empty response from Ollama')

        console.log(`\n🎭 Dramatic Changelog Entry:\n${output}\n`);
    } catch (err) {
        if (err.code === 'ECONNABORTED') {
            console.error('Request to Ollama timed out. The model may still be loading.')
        } else if (err.response) {
            console.error(`Ollama responded with ${err.response.status}: ${err.response.data}`)
        } else {
            console.error(`Unexpected error: ${err.message}`)
        }

        process.exit(1)
    }
}


await generateDramaticLog(input)