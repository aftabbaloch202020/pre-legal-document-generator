export type UserRole = "USER" | "ADMIN";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "email"
  | "select"
  | "checkbox";

export interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[]; // Used if type === "select"
  defaultValue?: string | number | boolean;
  section?: string; // Logical grouping, e.g. "Parties", "Terms", "Financials"
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface TemplateData {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  contentTemplate: string;
  fieldsSchema: FieldDefinition[];
  isPopular?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentData {
  id: string;
  userId: string;
  templateId: string;
  title: string;
  status: "DRAFT" | "GENERATED";
  formData: Record<string, any>;
  generatedContent: string;
  createdAt: string;
  updatedAt: string;
  template?: {
    id: string;
    title: string;
    slug: string;
    category?: {
      name: string;
      slug: string;
    };
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
