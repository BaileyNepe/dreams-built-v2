#!/bin/bash

INPUT="dreamsbuilt.webm"
OUTPUT="dreamsbuilt-min.webm"
BITRATE="800k"  # Adjust bitrate as needed (e.g., 1M for 1 Mbps)
CRF="32"      # Constant rate factor (lower is higher quality)

# First pass
ffmpeg -y -i "$INPUT" -c:v libvpx-vp9 -b:v $BITRATE -crf $CRF -pass 1 -an -f null /dev/null

# Second pass
ffmpeg -i "$INPUT" -c:v libvpx-vp9 -b:v $BITRATE -crf $CRF -pass 2 -c:a libopus "$OUTPUT"
