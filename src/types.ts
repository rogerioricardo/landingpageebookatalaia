export interface Chapter {
  id: number;
  number: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  iconName: string;
  keyTakeaways: string[];
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  clientCountEstimate: string;
  createdAt: string;
}

export interface CalculatorState {
  camerasCount: number;
  monthlyFeePerCamera: number;
  operatingCostPercentage: number;
}
