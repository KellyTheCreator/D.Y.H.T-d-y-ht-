// Utility functions for creating cloud backgrounds for panels

export const CLOUD_BG_URL = "/myclouds.png";

/**
 * Creates a CSS background style for panels using the cloud image
 * @param opacity - Background opacity (0-1)
 * @param scale - Scale of the cloud image (0.5-2.0)
 * @param position - Background position
 * @returns CSS background style string
 */
export function createCloudBackground(
  opacity: number = 0.7,
  scale: number = 0.8,
  position: string = 'center'
): string {
  return `url('${CLOUD_BG_URL}') ${position}/${scale * 100}% no-repeat, rgba(30,34,36,${opacity})`;
}

/**
 * Creates a background style for the main app
 */
export function createMainBackground(): string {
  return `url('${CLOUD_BG_URL}') center/cover no-repeat, linear-gradient(135deg, #232526 0%, #0f2027 100%)`;
}

/**
 * Creates a background style for panels with fitted cloud background
 * @param panelSize - 'small' | 'medium' | 'large'
 * @param position - Position of the cloud within the panel
 */
export function createPanelCloudBackground(
  panelSize: 'small' | 'medium' | 'large' = 'medium',
  position: string = 'center'
): string {
  const scales = {
    small: 0.6,
    medium: 0.8,
    large: 1.0
  };
  
  const opacities = {
    small: 0.6,
    medium: 0.7,
    large: 0.8
  };
  
  return createCloudBackground(opacities[panelSize], scales[panelSize], position);
}

/**
 * Theme colors for consistent styling
 */
export const colors = {
  cobalt: "#38B6FF",
  black: "#181a1b", 
  dark: "#232526",
  accent: "#0f2027",
  gray: "#222",
  text: "#eee",
  border: "#222d",
  cloud: {
    light: "rgba(56, 182, 255, 0.2)",
    medium: "rgba(56, 182, 255, 0.3)",
    dark: "rgba(56, 182, 255, 0.4)"
  }
};

/**
 * Creates a filter effect for cloud backgrounds
 */
export function createCloudFilter(brightness: number = 1.1, contrast: number = 1.2): string {
  return `brightness(${brightness}) contrast(${contrast}) sepia(0.1) hue-rotate(200deg)`;
}