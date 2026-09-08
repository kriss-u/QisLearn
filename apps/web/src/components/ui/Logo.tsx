import { Box, type BoxProps } from "@chakra-ui/react";

/**
 * The QisLearn mark: a Bloch-sphere nucleus with two crossed orbits and an
 * electron dot, in the brand's teal/ember two-tone. Kept as inline SVG (not
 * an <img>) so it stays crisp at any size and can be dropped anywhere in the
 * UI, not just the favicon.
 */
export function Logo(props: BoxProps) {
  return (
    <Box {...props} lineHeight="0">
      <svg viewBox="0 0 40 40" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="16.5" stroke="#06b6d4" strokeWidth="2.5" />
        <ellipse
          cx="20"
          cy="20"
          rx="16.5"
          ry="6.25"
          stroke="#f2591a"
          strokeWidth="2.25"
          transform="rotate(-30 20 20)"
        />
        <ellipse
          cx="20"
          cy="20"
          rx="16.5"
          ry="6.25"
          stroke="#06b6d4"
          strokeWidth="2.25"
          opacity="0.5"
          transform="rotate(30 20 20)"
        />
        <circle cx="20" cy="20" r="3.4" fill="#f2591a" />
        <circle cx="33.2" cy="11.6" r="2.6" fill="#06b6d4" />
      </svg>
    </Box>
  );
}
