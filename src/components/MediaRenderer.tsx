import React from 'react';
import { Media } from '../types';

interface MediaRendererProps {
  media?: Media | null;
  className?: string;
}

export default function MediaRenderer({ media, className = "" }: MediaRendererProps) {
  if (!media || !media.url) return null;

  const containerClass = `rounded-2xl overflow-hidden border border-black/5 shadow-sm ${className}`;

  if (media.type === 'image') {
    return (
      <div className={containerClass}>
        <img 
          src={media.url} 
          alt="Question media" 
          className="w-full h-auto object-cover max-h-[400px]"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (media.type === 'video') {
    return (
      <div className={containerClass}>
        <video 
          src={media.url} 
          controls 
          className="w-full h-auto max-h-[400px]"
        />
      </div>
    );
  }

  if (media.type === 'audio') {
    return (
      <div className={`p-4 bg-gray-50 rounded-2xl border border-gray-100 ${className}`}>
        <audio 
          src={media.url} 
          controls 
          className="w-full"
        />
      </div>
    );
  }

  return null;
}
