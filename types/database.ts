export type Json =
  | boolean
  | null
  | number
  | string
  | Json[]
  | { [key: string]: Json | undefined };

export type AccountType = "cash" | "normal" | "other" | "savings" | "travel";
export type CategoryType = "expense" | "income" | "special";
export type DestinationType = "ahorros" | "normal" | "viajes";
export type BucketMovementType = "contribution" | "withdrawal";
export type RecurringItemType = "expense" | "income";
export type QuickActionType = "expense" | "income";
export type TransactionStatus = "confirmed" | "edited" | "pending";
export type TransactionType = "expense" | "income" | "transfer";

type PublicTables = {
  accounts: {
    Row: {
      created_at: string;
      current_balance: number;
      id: string;
      initial_balance: number;
      is_active: boolean;
      name: string;
      sort_order: number;
      type: AccountType;
      updated_at: string;
      user_id: string;
    };
    Insert: {
      created_at?: string;
      current_balance?: number;
      id?: string;
      initial_balance?: number;
      is_active?: boolean;
      name: string;
      sort_order?: number;
      type: AccountType;
      updated_at?: string;
      user_id: string;
    };
    Update: {
      created_at?: string;
      current_balance?: number;
      id?: string;
      initial_balance?: number;
      is_active?: boolean;
      name?: string;
      sort_order?: number;
      type?: AccountType;
      updated_at?: string;
      user_id?: string;
    };
    Relationships: [];
  };
  categories: {
    Row: {
      color: string | null;
      created_at: string;
      icon: string | null;
      id: string;
      is_active: boolean;
      is_system: boolean;
      name: string;
      sort_order: number;
      type: CategoryType;
      updated_at: string;
      user_id: string;
    };
    Insert: {
      color?: string | null;
      created_at?: string;
      icon?: string | null;
      id?: string;
      is_active?: boolean;
      is_system?: boolean;
      name: string;
      sort_order?: number;
      type: CategoryType;
      updated_at?: string;
      user_id: string;
    };
    Update: {
      color?: string | null;
      created_at?: string;
      icon?: string | null;
      id?: string;
      is_active?: boolean;
      is_system?: boolean;
      name?: string;
      sort_order?: number;
      type?: CategoryType;
      updated_at?: string;
      user_id?: string;
    };
    Relationships: [];
  };
  profiles: {
    Row: {
      created_at: string;
      email: string | null;
      id: string;
    };
    Insert: {
      created_at?: string;
      email?: string | null;
      id: string;
    };
    Update: {
      created_at?: string;
      email?: string | null;
      id?: string;
    };
    Relationships: [];
  };
  quick_actions: {
    Row: {
      category_id: string | null;
      color: string | null;
      created_at: string;
      default_amount: number | null;
      icon: string | null;
      id: string;
      is_active: boolean;
      label: string;
      sort_order: number;
      subcategory_id: string | null;
      type: QuickActionType;
      updated_at: string;
      user_id: string;
    };
    Insert: {
      category_id?: string | null;
      color?: string | null;
      created_at?: string;
      default_amount?: number | null;
      icon?: string | null;
      id?: string;
      is_active?: boolean;
      label: string;
      sort_order?: number;
      subcategory_id?: string | null;
      type: QuickActionType;
      updated_at?: string;
      user_id: string;
    };
    Update: {
      category_id?: string | null;
      color?: string | null;
      created_at?: string;
      default_amount?: number | null;
      icon?: string | null;
      id?: string;
      is_active?: boolean;
      label?: string;
      sort_order?: number;
      subcategory_id?: string | null;
      type?: QuickActionType;
      updated_at?: string;
      user_id?: string;
    };
    Relationships: [];
  };
  recurring_items: {
    Row: {
      account_id: string | null;
      amount: number;
      auto_create: boolean;
      category_id: string | null;
      created_at: string;
      day_of_month: number;
      frequency: string;
      id: string;
      include_in_living_expenses: boolean;
      is_active: boolean;
      is_investment: boolean;
      is_travel_income: boolean;
      name: string;
      subcategory_id: string | null;
      type: RecurringItemType;
      updated_at: string;
      user_id: string;
    };
    Insert: {
      account_id?: string | null;
      amount: number;
      auto_create?: boolean;
      category_id?: string | null;
      created_at?: string;
      day_of_month: number;
      frequency?: string;
      id?: string;
      include_in_living_expenses?: boolean;
      is_active?: boolean;
      is_investment?: boolean;
      is_travel_income?: boolean;
      name: string;
      subcategory_id?: string | null;
      type: RecurringItemType;
      updated_at?: string;
      user_id: string;
    };
    Update: {
      account_id?: string | null;
      amount?: number;
      auto_create?: boolean;
      category_id?: string | null;
      created_at?: string;
      day_of_month?: number;
      frequency?: string;
      id?: string;
      include_in_living_expenses?: boolean;
      is_active?: boolean;
      is_investment?: boolean;
      is_travel_income?: boolean;
      name?: string;
      subcategory_id?: string | null;
      type?: RecurringItemType;
      updated_at?: string;
      user_id?: string;
    };
    Relationships: [];
  };
  savings_buckets: {
    Row: {
      color: string | null;
      created_at: string;
      current_balance: number;
      icon: string | null;
      id: string;
      initial_balance: number;
      is_active: boolean;
      name: string;
      sort_order: number;
      target_amount: number | null;
      updated_at: string;
      user_id: string;
    };
    Insert: {
      color?: string | null;
      created_at?: string;
      current_balance?: number;
      icon?: string | null;
      id?: string;
      initial_balance?: number;
      is_active?: boolean;
      name: string;
      sort_order?: number;
      target_amount?: number | null;
      updated_at?: string;
      user_id: string;
    };
    Update: {
      color?: string | null;
      created_at?: string;
      current_balance?: number;
      icon?: string | null;
      id?: string;
      initial_balance?: number;
      is_active?: boolean;
      name?: string;
      sort_order?: number;
      target_amount?: number | null;
      updated_at?: string;
      user_id?: string;
    };
    Relationships: [];
  };
  bucket_movements: {
    Row: {
      amount: number;
      bucket_id: string;
      created_at: string;
      date: string;
      description: string | null;
      id: string;
      month: string;
      type: BucketMovementType;
      updated_at: string;
      user_id: string;
    };
    Insert: {
      amount: number;
      bucket_id: string;
      created_at?: string;
      date: string;
      description?: string | null;
      id?: string;
      month: string;
      type: BucketMovementType;
      updated_at?: string;
      user_id: string;
    };
    Update: {
      amount?: number;
      bucket_id?: string;
      created_at?: string;
      date?: string;
      description?: string | null;
      id?: string;
      month?: string;
      type?: BucketMovementType;
      updated_at?: string;
      user_id?: string;
    };
    Relationships: [];
  };
  subcategories: {
    Row: {
      category_id: string;
      created_at: string;
      default_destination: DestinationType;
      id: string;
      is_active: boolean;
      is_investment: boolean;
      is_travel_income: boolean;
      name: string;
      sort_order: number;
      updated_at: string;
      user_id: string;
    };
    Insert: {
      category_id: string;
      created_at?: string;
      default_destination?: DestinationType;
      id?: string;
      is_active?: boolean;
      is_investment?: boolean;
      is_travel_income?: boolean;
      name: string;
      sort_order?: number;
      updated_at?: string;
      user_id: string;
    };
    Update: {
      category_id?: string;
      created_at?: string;
      default_destination?: DestinationType;
      id?: string;
      is_active?: boolean;
      is_investment?: boolean;
      is_travel_income?: boolean;
      name?: string;
      sort_order?: number;
      updated_at?: string;
      user_id?: string;
    };
    Relationships: [];
  };
  transactions: {
    Row: {
      account_id: string | null;
      amount: number;
      category_id: string | null;
      counts_for_savings: boolean;
      created_at: string;
      date: string;
      description: string | null;
      destination_account_id: string | null;
      generated_for_month: string | null;
      id: string;
      include_in_living_expenses: boolean;
      is_fixed: boolean;
      is_investment: boolean;
      is_reimbursement: boolean;
      is_recurring: boolean;
      is_travel_income: boolean;
      merchant: string | null;
      month: string;
      reimburses_transaction_id: string | null;
      recurring_item_id: string | null;
      status: TransactionStatus;
      subcategory_id: string | null;
      type: TransactionType;
      updated_at: string;
      user_id: string;
    };
    Insert: {
      account_id?: string | null;
      amount: number;
      category_id?: string | null;
      counts_for_savings?: boolean;
      created_at?: string;
      date: string;
      description?: string | null;
      destination_account_id?: string | null;
      generated_for_month?: string | null;
      id?: string;
      include_in_living_expenses?: boolean;
      is_fixed?: boolean;
      is_investment?: boolean;
      is_reimbursement?: boolean;
      is_recurring?: boolean;
      is_travel_income?: boolean;
      merchant?: string | null;
      month: string;
      reimburses_transaction_id?: string | null;
      recurring_item_id?: string | null;
      status?: TransactionStatus;
      subcategory_id?: string | null;
      type: TransactionType;
      updated_at?: string;
      user_id: string;
    };
    Update: {
      account_id?: string | null;
      amount?: number;
      category_id?: string | null;
      counts_for_savings?: boolean;
      created_at?: string;
      date?: string;
      description?: string | null;
      destination_account_id?: string | null;
      generated_for_month?: string | null;
      id?: string;
      include_in_living_expenses?: boolean;
      is_fixed?: boolean;
      is_investment?: boolean;
      is_reimbursement?: boolean;
      is_recurring?: boolean;
      is_travel_income?: boolean;
      merchant?: string | null;
      month?: string;
      reimburses_transaction_id?: string | null;
      recurring_item_id?: string | null;
      status?: TransactionStatus;
      subcategory_id?: string | null;
      type?: TransactionType;
      updated_at?: string;
      user_id?: string;
    };
    Relationships: [];
  };
  user_preferences: {
    Row: {
      created_at: string;
      currency: string;
      default_account_id: string | null;
      default_month: string | null;
      hide_investment_from_living_expenses: boolean;
      id: string;
      updated_at: string;
      user_id: string;
    };
    Insert: {
      created_at?: string;
      currency?: string;
      default_account_id?: string | null;
      default_month?: string | null;
      hide_investment_from_living_expenses?: boolean;
      id?: string;
      updated_at?: string;
      user_id: string;
    };
    Update: {
      created_at?: string;
      currency?: string;
      default_account_id?: string | null;
      default_month?: string | null;
      hide_investment_from_living_expenses?: boolean;
      id?: string;
      updated_at?: string;
      user_id?: string;
    };
    Relationships: [];
  };
};

export type Database = {
  public: {
    CompositeTypes: Record<string, never>;
    Enums: Record<string, never>;
    Functions: Record<string, never>;
    Tables: PublicTables;
    Views: Record<string, never>;
  };
};

export type Tables<TableName extends keyof PublicTables> =
  PublicTables[TableName]["Row"];

export type TablesInsert<TableName extends keyof PublicTables> =
  PublicTables[TableName]["Insert"];

export type TablesUpdate<TableName extends keyof PublicTables> =
  PublicTables[TableName]["Update"];
