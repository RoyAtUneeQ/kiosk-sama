export interface GuidedExperienceScene {
  sceneKey: string;
  rootEnv: string;
  path: string;
  pageThumbnailImage: string;
}

export interface GuidedExperienceData {
  candidate: GuidedExperienceScene;
  current: GuidedExperienceScene;
}
