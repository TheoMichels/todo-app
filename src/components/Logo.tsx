import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { colors } from "../theme/colors";

type Props = {
  size?: number;
};

// Reprend le "check" géométrique de la nouvelle icône, avec un dégradé pétrole vers indigo
export function Logo({ size = 32 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="10 20 100 85">
      <Defs>
        <LinearGradient id="checkGradient" x1="0%" y1="50%" x2="100%" y2="50%">
          <Stop offset="0%" stopColor={colors.brand} />
          <Stop offset="100%" stopColor={colors.accent} />
        </LinearGradient>
      </Defs>
      <Path
        d="M 25 65 L 50 90 L 95 35"
        fill="none"
        stroke="url(#checkGradient)"
        strokeWidth="20"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </Svg>
  );
}
