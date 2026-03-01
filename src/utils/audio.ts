export const playSound = (type: 'correct' | 'wrong' | 'timer' | 'winner') => {
  const sounds = {
    correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
    wrong: 'https://assets.mixkit.co/active_storage/sfx/2959/2959-preview.mp3',
    timer: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    winner: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'
  };

  const audio = new Audio(sounds[type]);
  audio.play().catch(err => console.error('Error playing sound:', err));
  return audio;
};
