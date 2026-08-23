export type Section = {
  id: string;
  name: string;
  createdAt: number;
};

// Not a real section: a virtual view listing done tasks from every section.
export const TRASH_SECTION_ID = "__trash__";
