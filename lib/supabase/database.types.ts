export type OrderItemStatus =
  | "New"
  | "Measurement Pending"
  | "Vendor Assigned"
  | "Ready"
  | "Installation Scheduled"
  | "Installed"
  | "Completed";

export type PaymentStatus = "Paid" | "Partial" | "Pending" | "Overdue";

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      vendors: {
        Row: {
          id: string;
          name: string;
          contact_person: string | null;
          phone: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
        };
        Update: {
          name?: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          order_number: string;
          project_name: string;
          payment_status: PaymentStatus;
          paid_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          order_number: string;
          project_name: string;
          payment_status?: PaymentStatus;
          paid_amount?: number;
        };
        Update: {
          customer_id?: string;
          project_name?: string;
          payment_status?: PaymentStatus;
          paid_amount?: number;
        };
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          name: string;
          category: string;
          base_price: number;
          description: string | null;
          active_status: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          base_price?: number;
          description?: string | null;
          active_status?: boolean;
        };
        Update: {
          name?: string;
          category?: string;
          base_price?: number;
          description?: string | null;
          active_status?: boolean;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          vendor_id: string | null;
          name: string;
          status: OrderItemStatus;
          quantity: number;
          unit_price: number;
          amount: number;
          width: number | null;
          height: number | null;
          depth: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          vendor_id?: string | null;
          name: string;
          status?: OrderItemStatus;
          quantity?: number;
          unit_price?: number;
          amount?: number;
          width?: number | null;
          height?: number | null;
          depth?: number | null;
        };
        Update: {
          product_id?: string | null;
          vendor_id?: string | null;
          name?: string;
          status?: OrderItemStatus;
          quantity?: number;
          unit_price?: number;
          amount?: number;
          width?: number | null;
          height?: number | null;
          depth?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          amount: number;
          payment_date: string;
          method: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          amount: number;
          payment_date?: string;
          method?: string | null;
          notes?: string | null;
        };
        Update: {
          amount?: number;
          payment_date?: string;
          method?: string | null;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      erp_settings: {
        Row: {
          id: string;
          order_number_prefix: string;
          order_number_format: string;
          default_item_status: OrderItemStatus;
          default_payment_status: PaymentStatus;
          measurement_unit: string;
          payment_terms: string;
          vendor_categories: unknown;
          supported_door_types: unknown;
          order_stages: unknown;
          status_colors: unknown;
          company_name: string;
          company_phone: string | null;
          company_address: string | null;
          gst_number: string | null;
          dark_mode: boolean;
          accent_color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number_prefix?: string;
          order_number_format?: string;
          default_item_status?: OrderItemStatus;
          default_payment_status?: PaymentStatus;
          measurement_unit?: string;
          payment_terms?: string;
          vendor_categories?: unknown;
          supported_door_types?: unknown;
          order_stages?: unknown;
          status_colors?: unknown;
          company_name?: string;
          company_phone?: string | null;
          company_address?: string | null;
          gst_number?: string | null;
          dark_mode?: boolean;
          accent_color?: string;
        };
        Update: {
          order_number_prefix?: string;
          order_number_format?: string;
          default_item_status?: OrderItemStatus;
          default_payment_status?: PaymentStatus;
          measurement_unit?: string;
          payment_terms?: string;
          vendor_categories?: unknown;
          supported_door_types?: unknown;
          order_stages?: unknown;
          status_colors?: unknown;
          company_name?: string;
          company_phone?: string | null;
          company_address?: string | null;
          gst_number?: string | null;
          dark_mode?: boolean;
          accent_color?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_order_number: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      order_item_status: OrderItemStatus;
      payment_status: PaymentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type Vendor = Database["public"]["Tables"]["vendors"]["Row"];
export type DbOrder = Database["public"]["Tables"]["orders"]["Row"];
export type DbOrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type DbPayment = Database["public"]["Tables"]["payments"]["Row"];
export type DbErpSettings = Database["public"]["Tables"]["erp_settings"]["Row"];
export type DbProduct = Database["public"]["Tables"]["products"]["Row"];
