
export interface CreateAgentDto {
  name: string;
  instructions: string;
  serviceId: string;
  statusId: string;
  extensionData?: string;
  temperature?: number | null;
  topP?: number | null;
  frequencyPenalty?: number | null;
  presencePenalty?: number | null;
  maxTokens?: number | null;
  functionChoiceBehavior?: string;
}

export interface UpdateAgentDto extends CreateAgentDto {
  id: string;
}

export interface AgentSearchParams {
  name?: string;
  statusId?: string;
  serviceId?: string;
  pageNumber?: number;
  pageSize?: number;
}