// Namespace for TTS functions
var TTS = TTS || {};

TTS.queue = [];
TTS.isSpeaking = false;

TTS.textToSpeech = function(text, voiceGender) {
    console.log('textToSpeech function called.');
    console.log('Text to convert:', text);
    console.log('VoiceGender:', voiceGender);

    if ('speechSynthesis' in window) {
        console.log('SpeechSynthesis is supported.');

        var voices = speechSynthesis.getVoices();
        console.log('Available voices:', voices);

        if (voices.length > 0) {
            var selectedVoice;

            if (voiceGender === 'male') {
                selectedVoice = voices.find(function(voice) {
                    return voice.lang === 'en-US' && (voice.name.includes('Male') || voice.name.includes('David'));
                }) || voices[0];
            } else if (voiceGender === 'female') {
                selectedVoice = voices.find(function(voice) {
                    return voice.lang === 'en-US' && (voice.name.includes('Female') || voice.name.includes('Zira') || voice.name.includes('Cortana'));
                }) || voices[0];
            } else {
                selectedVoice = voices[0]; // Default to the first available voice
            }

            console.log('Selected voice:', selectedVoice);
        } else {
            console.log('No voices available.');
        }

        // Split the text into smaller chunks
        var chunkSize = 150; // Adjust the chunk size as needed
        var chunks = TTS.splitTextIntoChunks(text, chunkSize);
        console.log('Text split into chunks:', chunks);

        // Add chunks to the queue
        TTS.queue = TTS.queue.concat(chunks.map(chunk => ({ text: chunk, voice: selectedVoice })));

        // Start speaking if not already speaking
        if (!TTS.isSpeaking) {
            TTS.processQueue();
        }
    } else {
        console.log('Text-to-speech not supported in this browser.');
    }
};

TTS.splitTextIntoChunks = function(text, chunkSize) {
    console.log('splitTextIntoChunks function called.');
    console.log('Text to split:', text);
    console.log('Chunk size:', chunkSize);

    var words = text.split(' ');
    var chunks = [];
    var currentChunk = '';

    for (var i = 0; i < words.length; i++) {
        if (currentChunk.length + words[i].length + 1 > chunkSize) {
            chunks.push(currentChunk.trim());
            currentChunk = '';
        }
        currentChunk += words[i] + ' ';
    }

    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }

    console.log('Chunks created:', chunks);
    return chunks;
};

TTS.processQueue = function() {
    if (TTS.queue.length > 0 && !TTS.isSpeaking) {
        TTS.isSpeaking = true;
        var item = TTS.queue.shift();
        var utterance = new SpeechSynthesisUtterance(item.text);
        utterance.voice = item.voice;
        utterance.pitch = 1;
        utterance.rate = 0.9;
        utterance.volume = 1;

        // Event handlers for debugging
        utterance.onstart = function() {
            console.log('Speech started.');
        };

        utterance.onend = function() {
            console.log('Speech ended.');
            TTS.isSpeaking = false;
            TTS.processQueue(); // Speak the next chunk
        };

        utterance.onerror = function(event) {
            console.error('Speech error:', event.error);
            TTS.isSpeaking = false;
            TTS.processQueue(); // Try the next chunk
        };

        utterance.onpause = function() {
            console.log('Speech paused.');
        };

        utterance.onresume = function() {
            console.log('Speech resumed.');
        };

        utterance.onboundary = function(event) {
            console.log(`Speech reached word boundary at ${event.charIndex} character.`);
        };

        utterance.onmark = function(event) {
            console.log(`Speech reached mark at ${event.charIndex} character.`);
        };

        // Speak the text
        speechSynthesis.speak(utterance);
        console.log('Speech synthesis initiated.');
    } else if (TTS.queue.length === 0) {
        console.log('All chunks spoken.');
        setTimeout(function() {
            TTS.triggerStorylineAction();
        }, 3000); // Wait for 3 seconds (3000 milliseconds)
    }
};

TTS.triggerStorylineAction = function() {
    console.log('triggerStorylineAction function called.');
    var player = GetPlayer();
    if (player) {
        // Example: Set a variable in Storyline
        player.SetVar("TTSCompleted", true);
        console.log('TTSCompleted variable set to true.');

        // You can also navigate to a different slide or perform other actions
        // player.GoToSlide(2); // Example: Navigate to slide 2
    } else {
        console.error('GetPlayer() returned null or undefined.');
    }
};

// Function to get the text variable from Storyline and convert it to speech
TTS.convertMessageToSpeech = function(variableName, voiceGender) {
    console.log('convertMessageToSpeech function called.');
    var player = GetPlayer();
    if (player) {
        var messageText = player.GetVar(variableName);
        console.log(`${variableName} variable:`, messageText);
        TTS.textToSpeech(messageText, voiceGender);
    } else {
        console.error('GetPlayer() returned null or undefined.');
    }
};

// Expose a function to set the message text and convert it to speech
window.setMessageTextAndConvert = function(messageText, voiceGender) {
    console.log('setMessageTextAndConvert function called.');
    TTS.textToSpeech(messageText, voiceGender);
};
