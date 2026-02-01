export interface SubTopic {
  id: string;
  name: string;
  content?: {
    type: 'notes' | 'videos' | 'links' | 'mockTests' | 'mcqs' | string;
    data: any;
  };
  subTopics?: SubTopic[];
}

export interface ContentType {
  id: string;
  name: string;
  icon?: string;
  type: 'notes' | 'videos' | 'links' | 'mockTests' | 'mcqs' | string;
  order: number;
  subTopics: SubTopic[];
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  banner?: string;
  contentTypes: ContentType[];
}

export interface Category {
  id: string;
  name: string;
  order: number;
  subjects: Subject[];
}
