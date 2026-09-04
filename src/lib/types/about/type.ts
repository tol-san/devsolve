
export type BadgeColor = "pink" | "purple" | "blue";

export interface TeamMember {
  name: string;
  subRole?: string;
  badge?: string;
  badgeColor?: BadgeColor;
  quote: string;
  image: string;
  github?: string;
  linkedin?: string;
  facebook?: string;
  telegram?: string;
  email?: string;
}

export interface Technology {
  name: string;
  description: string;
  iconName: string;
}

export interface Offering {
  iconName: string;
  title: string;
  description: string;
  accentBg: string;
  accentText: string;
  borderColor: string;
}