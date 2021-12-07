type Settings = {
  limitSMSPerDay: number;
};

type TemplateData = {
  sent: boolean;
  number: string;
  data: {
    [key: string]: string;
  };
};

type Project = {
  rows: {[key: string]: TemplateData};
  template: string;
  projectName: string;
};

type State = {
  version: number;
  projects: Project[];
  settings: Settings;
  usedSMS: {[key: string]: number};
};
