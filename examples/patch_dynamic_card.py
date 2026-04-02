import re

with open('/Users/shenruiyang/AI/ORBCAFE/src/components/AgentUI/components/core/DynamicCardRenderer.tsx', 'r') as f:
    content = f.read()

imports = """import MarkdownRenderer from '../renderers/MarkdownRenderer'
import ErrorCard from '../cards/ErrorCard'
import WarningCard from '../cards/WarningCard'
import SuggestionsCard from '../cards/SuggestionsCard'
import ToolResultCard from '../cards/ToolResultCard'"""

content = content.replace("import MarkdownRenderer from '../renderers/MarkdownRenderer'", imports)

new_interfaces = """interface SAPCardTypeContent {
  type: 'sap-analytical-card' | 'sap-list-card' | 'sap-object-card' | 'sap-component-card';
  manifest: any;
}

interface AgentUICardTypeContent {
  type: 'error-card' | 'warning-card' | 'suggestions-card' | 'tool-result-card';
  [key: string]: any;
}

type ParsedCardData = TableTypeContent | ChartCardTypeContent | SAPCardTypeContent | AgentUICardTypeContent;"""

content = content.replace("""interface SAPCardTypeContent {
  type: 'sap-analytical-card' | 'sap-list-card' | 'sap-object-card' | 'sap-component-card';
  manifest: any;
}

type ParsedCardData = TableTypeContent | ChartCardTypeContent | SAPCardTypeContent;""", new_interfaces)


new_parsing = """    if (parsed.type === 'sap-analytical-card' || 
        parsed.type === 'sap-list-card' || 
        parsed.type === 'sap-object-card' ||
        parsed.type === 'sap-component-card') {
      if (parsed.manifest) {
        return parsed as SAPCardTypeContent;
      }
    }

    if (parsed.type === 'error-card' || 
        parsed.type === 'warning-card' || 
        parsed.type === 'suggestions-card' ||
        parsed.type === 'tool-result-card') {
      return parsed as AgentUICardTypeContent;
    }"""

content = content.replace("""    if (parsed.type === 'sap-analytical-card' || 
        parsed.type === 'sap-list-card' || 
        parsed.type === 'sap-object-card' ||
        parsed.type === 'sap-component-card') {
      if (parsed.manifest) {
        return parsed as SAPCardTypeContent;
      }
    }""", new_parsing)


new_switch = """      case 'sap-object-card':
      case 'sap-component-card':
        return <SimpleSAPCard {...cardData} />;
      case 'error-card':
        return <ErrorCard {...(cardData as any)} />;
      case 'warning-card':
        return <WarningCard {...(cardData as any)} />;
      case 'suggestions-card':
        return <SuggestionsCard {...(cardData as any)} />;
      case 'tool-result-card':
        return <ToolResultCard {...(cardData as any)} />;
      default:
        break;"""

content = content.replace("""      case 'sap-object-card':
      case 'sap-component-card':
        return <SimpleSAPCard {...cardData} />;
      default:
        break;""", new_switch)

with open('/Users/shenruiyang/AI/ORBCAFE/src/components/AgentUI/components/core/DynamicCardRenderer.tsx', 'w') as f:
    f.write(content)
