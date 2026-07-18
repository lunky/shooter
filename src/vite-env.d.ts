/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BadmintonMode: string;
  readonly VITE_Shots_name: string;
  readonly VITE_Flyers_name: string;
  readonly VITE_Badguy_name: string;
  readonly VITE_PeriodName: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
