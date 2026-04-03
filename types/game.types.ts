export interface ObjectProperties {
  [key: string]: any;
}

export interface GameObject {
  id: string;
  name?: string;
  properties?: ObjectProperties;
  [key: string]: any;
}

export interface ObjectIntent {
  action: string;
  target?: string;
  [key: string]: any;
}

export interface LearningEvent {
  type: string;
  word?: string;
  [key: string]: any;
}
