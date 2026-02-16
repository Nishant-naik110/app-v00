export interface FilterState {
  filters: Array<{
    label: string;
    checked?: boolean;
  }>;
  is_select_all: boolean;
  selected_count: number;
  loading?: boolean;
}

export interface FilterProps {
  filter: Record<string, FilterState>;
  onChange: (newState: Record<string, FilterState>) => void;
}