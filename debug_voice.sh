#!/bin/bash

# Debug script to filter voice recording logs
# Usage: ./debug_voice.sh

echo "🎤 Voice Recording Debug Logs"
echo "=============================="
echo ""
echo "To see voice debug logs in real-time, run:"
echo "npx react-native log-ios | grep 'VOICE_DEBUG\\|AUDIO_DEBUG'"
echo ""
echo "Or to see all logs with timestamps:"
echo "npx react-native log-ios | grep -E '(VOICE_DEBUG|AUDIO_DEBUG|Voice|Audio|Recording)'"
echo ""
echo "To start the app and watch logs simultaneously:"
echo "npx react-native run-ios && npx react-native log-ios | grep 'VOICE_DEBUG\\|AUDIO_DEBUG'"
