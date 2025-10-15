interface VoiceWaveAnimationProps {
  isActive: boolean;
}

const VoiceWaveAnimation = ({ isActive }: VoiceWaveAnimationProps) => {
  return (
    <div className="flex items-center justify-center h-32 gap-1.5 relative">
      {/* Outer glow effect */}
      {isActive && (
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      )}
      
      {/* Wave bars */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-300 relative ${
            isActive 
              ? "animate-wave bg-gradient-to-t from-primary via-accent to-primary shadow-glow-primary" 
              : "h-3 bg-primary/40"
          }`}
          style={{
            animationDelay: `${i * 0.08}s`,
            height: isActive ? undefined : "0.75rem",
          }}
        />
      ))}
    </div>
  );
};

export default VoiceWaveAnimation;
