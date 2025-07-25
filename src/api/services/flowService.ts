import apiClient from '../apiClient';
import type {AiModelListResponse } from "#/entity";
import { 
  type FlowStatus, 
  getFlowStatusId, 
  DEFAULT_FLOW_STATUS
} from '../../constant/flowStatus';

// ======= 优化后的扁平化接口设计 =======

// 基于节点类型的强类型配置
export type NodeConfig = 
  | AIDialogNodeConfig
  | AISummaryNodeConfig
  | DatabaseNodeConfig  
  | KnowledgeBaseNodeConfig
  | HTTPNodeConfig
  | ConditionNodeConfig
  | DataProcessNodeConfig
  | StartNodeConfig
  | EndNodeConfig
  | UserInputNodeConfig
  | ResponseNodeConfig
  | JsonProcessNodeConfig;

// AI对话节点配置
export interface AIDialogNodeConfig {
  nodeType: 'aiDialogNode';
  model: string;
  systemPrompt?: string;
  userMessage?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

// AI摘要节点配置
export interface AISummaryNodeConfig {
  nodeType: 'aiSummaryNode';
  model: string;
  systemPrompt?: string;
  userMessage?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  summaryStyle?: 'bullet_points' | 'paragraph' | 'keywords' | 'outline';
  summaryLength?: 'short' | 'medium' | 'long';
  maxSummaryLength?: number;
  language?: string;
  includeKeyPoints?: boolean;
  extractKeywords?: boolean;
}

// 数据库节点配置
export interface DatabaseNodeConfig {
  nodeType: 'databaseNode';
  dbType: string;
  connectionString: string;
  query: string;
  parameters?: Record<string, any>;
}

// 知识库节点配置
export interface KnowledgeBaseNodeConfig {
  nodeType: 'knowledgeBaseNode';
  knowledgeBaseId: string;
  searchQuery?: string;
  topK?: number;
  similarityThreshold?: number;
  searchType?: 'semantic' | 'keyword' | 'hybrid';
}

// HTTP节点配置
export interface HTTPNodeConfig {
  nodeType: 'httpNode';
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

// 条件判断节点配置
export interface ConditionNodeConfig {
  nodeType: 'conditionNode';
  condition: string;
  conditionType?: 'expression' | 'javascript' | 'simple';
}

// 数据处理节点配置
export interface DataProcessNodeConfig {
  nodeType: 'dataProcessNode';
  processType: 'transform' | 'filter' | 'aggregate' | 'sort' | 'group' | 'map' | 'reduce';
  transformScript?: string;
  filterCondition?: string;
  aggregateFields?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  groupBy?: string;
}

// 开始节点配置
export interface StartNodeConfig {
  nodeType: 'startNode';
  triggerType?: 'manual' | 'scheduled' | 'webhook' | 'event';
  initialData?: any;
}

// 结束节点配置
export interface EndNodeConfig {
  nodeType: 'endNode';
  outputFormat?: 'json' | 'text' | 'markdown' | 'xml';
  returnCode?: number;
  finalMessage?: string;
}

// 用户输入节点配置
export interface UserInputNodeConfig {
  nodeType: 'userInputNode';
  userInputType: 'text' | 'number' | 'boolean' | 'json' | 'file';
  placeholder?: string;
  defaultValue?: any;
  validation?: {
    required?: boolean;
    pattern?: string;
    min?: number;
    max?: number;
  };
  options?: Array<{ label: string; value: any }>;
}

// 响应节点配置
export interface ResponseNodeConfig {
  nodeType: 'responseNode';
  responseTemplate: string;
  responseFormat?: 'text' | 'json' | 'html' | 'markdown';
  statusCode?: number;
}

// JSON处理节点配置
export interface JsonProcessNodeConfig {
  nodeType: 'jsonProcessNode';
  operation: 'extract' | 'transform' | 'validate' | 'merge' | 'filter' | 'sort' | 'aggregate' | 'format' | 'schema' | 'compress';
  inputFormat?: 'json' | 'string' | 'auto';
  outputFormat?: {
    format: 'json' | 'csv' | 'xml' | 'yaml' | 'table';
    pretty?: boolean;
    encoding?: 'utf8' | 'base64';
    compression?: 'none' | 'gzip' | 'deflate';
  };
  extractConfig?: any;
  transformConfig?: any;
  validateConfig?: any;
  mergeConfig?: any;
  filterConfig?: any;
  sortConfig?: any;
  aggregateConfig?: any;
  errorHandling?: any;
  performanceConfig?: any;
  debugConfig?: any;
}

// ======= 扁平化的节点执行请求接口 =======
export interface OptimizedNodeExecutionRequest {
  // 节点标识
  nodeId: string;
  nodeType: string;
  label?: string;
  description?: string;
  
  // 执行环境
  executionId: string;
  stepId: string;
  workflowId: string;
  
  // 节点配置（强类型）
  config: NodeConfig;
  
  // 运行时数据
  variables: Record<string, any>;
  userInput?: string;
  userMessage?: string; // AI对话节点专用
  inputData?: any; // 数据处理节点专用
  previousdata?: string; // 上一节点结果的字符串格式
}

// ======= 向后兼容的接口（保留用于渐进迁移） =======

// 节点执行上下文接口 - 统一管理执行状态和变量
export interface NodeExecutionContext {
  variables: Record<string, any>; // 全局变量，包含 userInput 等所有运行时变量
  nodeResults: Record<string, any>; // 历史节点执行结果
  userInput?: string; // 当前用户输入（为兼容性保留）
  previousResult?: any; // 前一个节点的结果摘要
  previousdata?: string; // 新增：上一节点结果的字符串格式
  executionId?: string; // 执行计划ID
  stepId?: string; // 当前步骤ID
  workflowId?: string; // 工作流ID
}

// 节点执行配置接口
export interface NodeExecutionConfig {
  timeout: number;
  retryCount: number;
  async: boolean;
  enableLogging?: boolean;
  enableMetrics?: boolean;
}

// 通用节点输入接口（旧版本，保留兼容性）
export interface NodeExecutionInput {
  // 基础属性
  nodeId: string;
  nodeType: string;
  label?: string;
  description?: string;
  inputSource?: string; // '1' = 用户输入, '2' = 前一节点结果, '3' = 固定值
  
  // 节点特定配置 - 兼容旧版本的联合类型
  config: Record<string, any>;
  
  // 运行时数据 - 优化后已简化，移除重复字段
  runtimeData?: {
    userMessage?: string; // AI对话节点的用户消息
    data?: any; // 数据处理节点的输入数据
    // 注意：variables 和 userInput 已移至 context 中统一管理
  };
}

// 节点执行请求接口
export interface NodeExecutionRequest {
  input: NodeExecutionInput;
  context: NodeExecutionContext;
  executionConfig: NodeExecutionConfig;
}

// 节点执行响应接口
export interface NodeExecutionResponse {
  success: boolean;
  output?: string; // markdown 格式的字符串输出
  error?: string;
  executionTime?: number;
  nodeId: string;
  nodeType: string;
  timestamp: number;
  metadata?: {
    retryCount?: number;
    actualTimeout?: number;
    memoryUsage?: number;
  };
}

// 流程数据接口定义 - 后端实体对应
export interface FlowData {
  id?: string;
  name: string;
  description: string;
  nodes: string;  // 序列化的JSON字符串
  edges: string;  // 序列化的JSON字符串
  viewport?: string;  // 序列化的JSON字符串，包含 {x, y, zoom}
  nodeCount?: number;
  connectionCount?: number;
  status: FlowStatus;  // 必需参数 - 使用FlowStatus类型
  statusId?: string;   // 状态GUID，从FlowStatus映射获取
  tags?: string;  // 序列化的JSON字符串数组
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

// 前端使用的流程数据接口（原始对象格式）
export interface FlowDataRaw {
  id?: string;
  name: string;
  description: string;
  nodes: any[];  // 原始节点数组
  edges: any[];  // 原始边数组
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
  nodeCount?: number;
  connectionCount?: number;
  status: FlowStatus;  // 必需参数 - 使用FlowStatus类型
  statusId?: string;   // 状态GUID，从FlowStatus映射获取
  tags?: string[];  // 原始标签数组
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

// 流程列表查询参数
export interface FlowListParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  tags?: string[];
}

// 生成UUID的工具函数
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// 数据转换工具函数：将前端原始数据转换为后端实体格式
const convertToBackendFormat = (rawData: FlowDataRaw): FlowData => {
  return {
    ...rawData,
    nodes: JSON.stringify(rawData.nodes || []),
    edges: JSON.stringify(rawData.edges || []),
    viewport: rawData.viewport ? JSON.stringify(rawData.viewport) : undefined,
    tags: rawData.tags ? JSON.stringify(rawData.tags) : undefined,
    statusId: getFlowStatusId(rawData.status), // 自动映射状态GUID
  };
};

// 数据转换工具函数：将后端实体格式转换为前端原始数据
const convertToFrontendFormat = (backendData: FlowData): FlowDataRaw => {
  try {
    return {
      ...backendData,
      nodes: JSON.parse(backendData.nodes || '[]'),
      edges: JSON.parse(backendData.edges || '[]'),
      viewport: backendData.viewport ? JSON.parse(backendData.viewport) : undefined,
      tags: backendData.tags ? JSON.parse(backendData.tags) : undefined,
      statusId: getFlowStatusId(backendData.status), // 确保statusId一致
    };
  } catch (error) {
    console.error('Failed to parse backend data:', error);
    throw new Error('Invalid backend data format');
  }
};

// 批量转换函数
const convertListToFrontendFormat = (backendList: FlowData[]): FlowDataRaw[] => {
  return backendList.map(convertToFrontendFormat);
};

// 流程API服务
export const flowService = {
  // 获取流程列表
  getFlows: async (params?: FlowListParams): Promise<FlowDataRaw[]> => {
    const response = await apiClient.post({ url: '/flows/page', data: params });
    // 假设后端返回的是FlowData[]格式
    return convertListToFrontendFormat(response.data);
  },

  // 根据ID获取流程详情
  getFlowById: async (id: string): Promise<FlowDataRaw> => {
    const response = await apiClient.get({ url: `/flows/${id}` });
    // 后端返回的数据结构为 { success: boolean, statusCode: number, message: string, data: FlowData }
    // 需要从 response.data 中获取实际的流程数据
    return convertToFrontendFormat(response);
  },

  

  // 创建新流程 - 发送实体格式，status为必需参数
  createFlow: async (flowData: Omit<FlowDataRaw, 'id'>): Promise<FlowDataRaw> => {
    // 前端生成唯一ID
    const flowId = generateUUID();
    
    // 验证status参数
    if (!flowData.status) {
      throw new Error('Status is required when creating a flow');
    }

    const rawDataWithId = {
      id: flowId,
      ...flowData,
      nodeCount: flowData.nodes.length,
      connectionCount: flowData.edges.length,
      status: 'draft', // 使用传入的status，不再有默认值
      statusId: getFlowStatusId('draft'), // 自动生成statusId
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 转换为后端实体格式
    const backendData = convertToBackendFormat(rawDataWithId);
    
    // 将ID拼接在路由中：POST /flows/{flowId}，发送实体格式
    const response = await apiClient.post({
      url: `/flows/${flowId}`,
      data: backendData
    });
    
    // 后端返回的是FlowData格式，转换为前端格式
    const result = convertToFrontendFormat(response);
    
    // 确保返回的结果保持我们发送的状态
    result.status = flowData.status;
    result.statusId = getFlowStatusId(flowData.status);
    
    return result;
  },

  // 更新流程 - 发送实体格式，status为必需参数
  updateFlow: async (id: string, flowData: Partial<FlowDataRaw> & { status: FlowStatus }): Promise<FlowDataRaw> => {
    // 验证status参数
    if (!flowData.status) {
      throw new Error('Status is required when updating a flow');
    }

    const rawDataWithMeta = {
      id,
      ...flowData,
      nodeCount: flowData.nodes ? flowData.nodes.length : undefined,
      connectionCount: flowData.edges ? flowData.edges.length : undefined,
      statusId: getFlowStatusId(flowData.status), // 自动生成statusId
      updatedAt: new Date().toISOString()
    };

    // 转换为后端实体格式（只转换有值的字段）
    const backendData: Partial<FlowData> & { status: FlowStatus; statusId: string } = {
      id,
      status: flowData.status,
      statusId: getFlowStatusId(flowData.status),
      updatedAt: rawDataWithMeta.updatedAt
    };
    
    // 只有当字段存在时才进行序列化转换
    if (flowData.name !== undefined) backendData.name = flowData.name;
    if (flowData.description !== undefined) backendData.description = flowData.description;
    if (flowData.nodes !== undefined) backendData.nodes = JSON.stringify(flowData.nodes);
    if (flowData.edges !== undefined) backendData.edges = JSON.stringify(flowData.edges);
    if (flowData.viewport !== undefined) backendData.viewport = JSON.stringify(flowData.viewport);
    if (flowData.tags !== undefined) backendData.tags = JSON.stringify(flowData.tags);
    if (rawDataWithMeta.nodeCount !== undefined) backendData.nodeCount = rawDataWithMeta.nodeCount;
    if (rawDataWithMeta.connectionCount !== undefined) backendData.connectionCount = rawDataWithMeta.connectionCount;
    if (flowData.createdBy !== undefined) backendData.createdBy = flowData.createdBy;
    
    // PUT /flows/{id} - 发送实体格式
    const response = await apiClient.put({
      url: `/flows/${id}`,
      data: backendData
    });
    
    // 后端返回的是FlowData格式，转换为前端格式
    const result = convertToFrontendFormat(response);
    
    // 确保返回的结果保持我们发送的状态，防止后端返回不一致的状态
    result.status = flowData.status;
    result.statusId = getFlowStatusId(flowData.status);
    
    return result;
  },

  // 删除流程
  deleteFlow: async (id: string) => {
    return await apiClient.delete({ url: `/flows/${id}` });
  },

  // 复制流程
  copyFlow: async (id: string, newName?: string): Promise<FlowDataRaw> => {
    // 先获取原流程数据
    const originalFlow = await flowService.getFlowById(id);
    
    // 生成新的流程ID
    const newFlowId = generateUUID();
    
    // 创建复制的流程数据，默认状态为draft
    const copiedFlowData: FlowDataRaw = {
      ...originalFlow,
      id: newFlowId,
      name: newName || `${originalFlow.name} - 副本`,
      status: DEFAULT_FLOW_STATUS, // 使用默认状态
      statusId: getFlowStatusId(DEFAULT_FLOW_STATUS),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 转换为后端格式并发送
    const backendData = convertToBackendFormat(copiedFlowData);
    
    const response = await apiClient.post({
      url: `/flows/${newFlowId}`,
      data: backendData
    });
    
    const result = convertToFrontendFormat(response);
    
    // 确保复制的流程保持draft状态
    result.status = DEFAULT_FLOW_STATUS;
    result.statusId = getFlowStatusId(DEFAULT_FLOW_STATUS);
    
    return result;
  },

  // 发布流程

  // 根据ID获取流程详情
  publishFlow: async (id: string) => {
     await apiClient.get({ url: `/flows/publish/${id}` });
  },


/**
   * 根据AI模型类型ID获取AI模型集合
   */
  getAiModelsByTypeId: () => {
    return apiClient.get<AiModelListResponse>({
      url:   "/aiModel/getByTypeId/0D826A41-45CE-4870-8893-A8D4FAECD3A4",
    });
  },

  // 归档流程
  archiveFlow: async (id: string): Promise<FlowDataRaw> => {
    const response = await apiClient.put({
      url: `/flows/${id}/archive`,
      data: { 
        status: 'archived',
        statusId: getFlowStatusId('archived')
      }
    });
    
    const result = convertToFrontendFormat(response);
    // 确保返回的状态正确
    result.status = 'archived';
    result.statusId = getFlowStatusId('archived');
    
    return result;
  },

  // 更新流程状态
  updateFlowStatus: async (id: string, status: FlowStatus): Promise<FlowDataRaw> => {
    const response = await apiClient.put({
      url: `/flows/${id}/status`,
      data: { 
        status,
        statusId: getFlowStatusId(status)
      }
    });
    
    const result = convertToFrontendFormat(response);
    // 确保返回的状态正确
    result.status = status;
    result.statusId = getFlowStatusId(status);
    
    return result;
  },

  // 暂停流程
  suspendFlow: async (id: string): Promise<FlowDataRaw> => {
    return flowService.updateFlowStatus(id, 'suspended');
  },

  // 恢复流程（从暂停状态恢复到发布状态）
  resumeFlow: async (id: string): Promise<FlowDataRaw> => {
    return flowService.updateFlowStatus(id, 'published');
  },

  // 运行流程
  runFlow: async (id: string, inputs?: any) => {
    const inputsData = inputs ? { inputs: JSON.stringify(inputs) } : {};
    
    return await apiClient.post({
      url: `/flows/${id}/run`,
      data: inputsData
    });
  },

  executeNode: async (request: OptimizedNodeExecutionRequest): Promise<NodeExecutionResponse> => {
    try {
      const startTime = Date.now();
      
      const response = await apiClient.post({
        url: '/flows/execute-node', // 新的API端点
        data: request,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const executionTime = Date.now() - startTime;

      return {
        success: response.success ?? true,
        output: response.output,
        error: response.error,
        executionTime: response.executionTime ?? executionTime,
        nodeId: request.nodeId,
        nodeType: request.nodeType,
        timestamp: response.timestamp ?? Date.now(),
        metadata: {
          retryCount: response.metadata?.retryCount ?? 0,
          actualTimeout: response.metadata?.actualTimeout ?? 30000,
          memoryUsage: response.metadata?.memoryUsage,
          ...response.metadata
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Node execution failed',
        executionTime: 0,
        nodeId: request.nodeId,
        nodeType: request.nodeType,
        timestamp: Date.now(),
        metadata: {
          retryCount: 0,
          actualTimeout: 30000
        }
      };
    }
  },

  buildNodeConfig: (nodeType: string, config: Record<string, any>): NodeConfig => {
    // 根据节点类型构建正确的强类型配置
    switch (nodeType) {
      case 'aiDialogNode':
        return {
          nodeType: 'aiDialogNode',
          model: config.model || '',
          systemPrompt: config.systemPrompt,
          userMessage: config.userMessage,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          stream: config.stream
        } as AIDialogNodeConfig;

      case 'aiSummaryNode':
        return {
          nodeType: 'aiSummaryNode',
          model: config.model || '',
          systemPrompt: config.systemPrompt,
          userMessage: config.userMessage,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          stream: config.stream,
          summaryStyle: config.summaryStyle || 'paragraph',
          summaryLength: config.summaryLength || 'medium',
          maxSummaryLength: config.maxSummaryLength || 300,
          language: config.language || 'zh-CN',
          // 修复布尔值处理 - 使用 ?? 运算符确保正确处理用户的真实选择
          includeKeyPoints: config.includeKeyPoints ?? false,
          extractKeywords: config.extractKeywords ?? false
        } as AISummaryNodeConfig;

      case 'databaseNode':
        return {
          nodeType: 'databaseNode',
          dbType: config.dbType || '',
          connectionString: config.connectionString || '',
          query: config.query || '',
          parameters: config.parameters
        } as DatabaseNodeConfig;

      case 'knowledgeBaseNode':
        return {
          nodeType: 'knowledgeBaseNode',
          knowledgeBaseId: config.knowledgeBaseId || '',
          searchQuery: config.searchQuery,
          topK: config.topK,
          similarityThreshold: config.similarityThreshold,
          searchType: config.searchType
        } as KnowledgeBaseNodeConfig;

      case 'httpNode':
        return {
          nodeType: 'httpNode',
          url: config.url || '',
          method: config.method || 'GET',
          headers: config.headers,
          body: config.body
        } as HTTPNodeConfig;

      case 'conditionNode':
        return {
          nodeType: 'conditionNode',
          condition: config.condition || '',
          conditionType: config.conditionType
        } as ConditionNodeConfig;

      case 'dataProcessNode':
        return {
          nodeType: 'dataProcessNode',
          processType: config.processType || 'transform',
          transformScript: config.transformScript,
          filterCondition: config.filterCondition,
          aggregateFields: config.aggregateFields,
          sortBy: config.sortBy,
          sortOrder: config.sortOrder,
          groupBy: config.groupBy
        } as DataProcessNodeConfig;

      case 'startNode':
        return {
          nodeType: 'startNode',
          triggerType: config.triggerType,
          initialData: config.initialData
        } as StartNodeConfig;

      case 'endNode':
        return {
          nodeType: 'endNode',
          outputFormat: config.outputFormat,
          returnCode: config.returnCode,
          finalMessage: config.finalMessage
        } as EndNodeConfig;

      case 'userInputNode':
        return {
          nodeType: 'userInputNode',
          userInputType: config.userInputType || 'text',
          placeholder: config.placeholder,
          defaultValue: config.defaultValue,
          validation: config.validation,
          options: config.options
        } as UserInputNodeConfig;

      case 'responseNode':
        return {
          nodeType: 'responseNode',
          responseTemplate: config.responseTemplate || '',
          responseFormat: config.responseFormat,
          statusCode: config.statusCode
        } as ResponseNodeConfig;

      case 'jsonProcessNode':
        return {
          nodeType: 'jsonProcessNode',
          operation: config.operation || 'extract',
          inputFormat: config.inputFormat || 'auto',
          outputFormat: config.outputFormat || {
            format: 'json',
            pretty: true
          },
          extractConfig: config.extractConfig,
          transformConfig: config.transformConfig,
          validateConfig: config.validateConfig,
          mergeConfig: config.mergeConfig,
          filterConfig: config.filterConfig,
          sortConfig: config.sortConfig,
          aggregateConfig: config.aggregateConfig,
          errorHandling: config.errorHandling,
          performanceConfig: config.performanceConfig,
          debugConfig: config.debugConfig
        } as JsonProcessNodeConfig;

      default:
        // 兜底处理：如果是未知节点类型，返回基础配置
        return {
          nodeType: nodeType as any,
          ...config
        } as NodeConfig;
    }
  },

  // ===== 优化后的旧版本到新版本的转换方法 =====
  convertToOptimizedRequest: (legacyRequest: NodeExecutionRequest): OptimizedNodeExecutionRequest => {
    const { input, context } = legacyRequest;
    
    return {
      // 节点标识（扁平化）
      nodeId: input.nodeId,
      nodeType: input.nodeType,
      label: input.label,
      description: input.description,
      
      // 执行环境（扁平化）
      executionId: context.executionId || '',
      stepId: context.stepId || '',
      workflowId: context.workflowId || '',
      
      // 节点配置（正确的强类型转换）
      config: flowService.buildNodeConfig(input.nodeType, input.config || {}),
      
      // 运行时数据（扁平化）
      variables: context.variables || {},
      userInput: context.userInput,
      userMessage: input.runtimeData?.userMessage,
      inputData: input.runtimeData?.data,
      previousdata: context.previousdata
    };
  },

  // ===== 直接构建优化请求的便捷方法 =====
  createOptimizedRequest: (params: {
    nodeId: string;
    nodeType: string;
    config: Record<string, any>;
    executionId: string;
    stepId: string;
    workflowId: string;
    variables?: Record<string, any>;
    userInput?: string;
    userMessage?: string;
    inputData?: any;
    previousdata?: string;
    label?: string;
    description?: string;
  }): OptimizedNodeExecutionRequest => {
    return {
      // 节点标识
      nodeId: params.nodeId,
      nodeType: params.nodeType,
      label: params.label,
      description: params.description,
      
      // 执行环境
      executionId: params.executionId,
      stepId: params.stepId,
      workflowId: params.workflowId,
      
      // 节点配置（强类型）
      config: flowService.buildNodeConfig(params.nodeType, params.config),
      
      // 运行时数据
      variables: params.variables || {},
      userInput: params.userInput,
      userMessage: params.userMessage,
      inputData: params.inputData,
      previousdata: params.previousdata
    };
  },

  // 验证流程配置
  validateFlow: async (flowData: FlowDataRaw) => {
    const backendData = convertToBackendFormat(flowData);
    
    return await apiClient.post({
      url: '/flows/validate',
      data: backendData
    });
  }
};

// 导出转换函数和UUID生成函数供其他地方使用
export { 
  convertToBackendFormat, 
  convertToFrontendFormat, 
  convertListToFrontendFormat, 
  generateUUID
};
