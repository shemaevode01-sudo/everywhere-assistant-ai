interface VoiceWaveAnimationProps {
  isActive: boolean;
}

const VoiceWaveAnimation = ({ isActive }: VoiceWaveAnimationProps) => {
  const bars = Array.from({ length: 5 });

  return (
    <div className="flex items-center justify-center gap-1.5 h-16">
      {bars.map((_, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full bg-gradient-accent transition-all duration-300 ${
            isActive ? "animate-wave" : "h-4"
          }`}
          style={{
            animationDelay: `${i * 0.1}s`,
            height: isActive ? undefined : "1rem",
          }}
        />
      ))}
    </div>
  );
};

export default VoiceWaveAnimation;
