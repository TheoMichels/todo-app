import Svg, { Ellipse } from "react-native-svg";
import { colors } from "../theme/colors";

type Props = {
  size?: number;
};

// Reprend le double chevron de la marque ITS4U : pétrole à gauche, orange à droite.
export function Logo({ size = 32 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Ellipse
        cx="60"
        cy="60"
        rx="45"
        ry="15"
        fill="none"
        stroke={colors.brand}
        strokeWidth="10"
        transform="rotate(45, 60, 60)"
      />
      <Ellipse
        cx="60"
        cy="60"
        rx="45"
        ry="15"
        fill="none"
        stroke={colors.accent}
        strokeWidth="10"
        transform="rotate(-45, 60, 60)"
      />
    </Svg>
  );
}
