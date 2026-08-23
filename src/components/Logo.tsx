import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  size?: number;
};

export function Logo({ size = 32 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id="logoOrbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#e881c4" />
          <Stop offset="50%" stopColor="#a35bd0" />
          <Stop offset="100%" stopColor="#5b3a91" />
        </LinearGradient>
      </Defs>

      <Ellipse
        cx="60"
        cy="60"
        rx="48"
        ry="18"
        fill="none"
        stroke="url(#logoOrbitGradient)"
        strokeWidth={3.5}
      />
      <Ellipse
        cx="60"
        cy="60"
        rx="48"
        ry="18"
        fill="none"
        stroke="url(#logoOrbitGradient)"
        strokeWidth={3.5}
        rotation={90}
        origin="60, 60"
      />

      <Circle cx="60" cy="60" r="13.5" fill="#b356d8" />
      <Path
        d="M53 60.5 L58 65.5 L68.5 53.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
