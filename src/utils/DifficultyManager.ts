import { Template } from '../ArcadeGameApp';

export interface DifficultyConfig {
  hintUnlockRate: number; // multiplier for hint unlock times
  hintPenaltyMultiplier: number; // multiplier for hint penalties
  responseHelpfulness: number; // 0-1, how helpful AI responses are
  partialMatchRewards: boolean; // whether to give feedback for partial matches
  maxHintsAllowed: number; // maximum hints allowed
  timeBeforeFirstHint: number; // seconds before first hint unlocks
  socialEngineeringTolerance: number; // 0-1, how easily the AI gives information
}

export interface GameState {
  messageCount: number;
  hintsUsed: number;
  timeElapsed: number;
  partialMatches: string[];
  lastApproach: 'social' | 'technical' | 'random' | null;
  difficultyConfig: DifficultyConfig;
}

export class DifficultyManager {
  private static difficultyConfigs: Record<string, DifficultyConfig> = {
    easy: {
      hintUnlockRate: 0.3, // hints unlock 3x faster
      hintPenaltyMultiplier: 0.1, // 90% less penalty
      responseHelpfulness: 0.95, // AI gives very helpful responses
      partialMatchRewards: true, // feedback for getting close
      maxHintsAllowed: 8,
      timeBeforeFirstHint: 15, // 15 seconds only
      socialEngineeringTolerance: 0.9, // extremely easy to trick
    },
    medium: {
      hintUnlockRate: 0.6, // hints unlock faster
      hintPenaltyMultiplier: 0.5, // half penalty
      responseHelpfulness: 0.8, // quite helpful
      partialMatchRewards: true, // still give feedback
      maxHintsAllowed: 6,
      timeBeforeFirstHint: 30, // 30 seconds
      socialEngineeringTolerance: 0.7, // fairly easy to trick
    },
    hard: {
      hintUnlockRate: 1.0, // normal hint unlock rate (was 1.8)
      hintPenaltyMultiplier: 1.0, // normal penalty (was 1.5)
      responseHelpfulness: 0.6, // still somewhat helpful (was 0.2)
      partialMatchRewards: true, // give partial feedback (was false)
      maxHintsAllowed: 4, // more hints (was 2)
      timeBeforeFirstHint: 60, // faster hints (was 120)
      socialEngineeringTolerance: 0.5, // more tolerant (was 0.1)
    },
  };

  static getConfig(difficulty: string): DifficultyConfig {
    return this.difficultyConfigs[difficulty] || this.difficultyConfigs.medium;
  }

  static checkPartialMatch(userMessage: string, secretCode: string, config: DifficultyConfig): {
    isPartialMatch: boolean;
    matchedWords: string[];
    matchScore: number;
    feedback: string;
  } {
    if (!config.partialMatchRewards) {
      return { isPartialMatch: false, matchedWords: [], matchScore: 0, feedback: '' };
    }

    const message = userMessage.toLowerCase().trim();
    const code = secretCode.toLowerCase();
    
    // Split the secret code into meaningful parts
    const codeWords = code.split(/[_\s-]+/).filter(word => word.length > 2);
    const messageWords = message.split(/\s+/);
    
    // Check for exact word matches
    const exactMatches = codeWords.filter(codeWord => 
      messageWords.some(msgWord => msgWord.includes(codeWord) || codeWord.includes(msgWord))
    );
    
    // Check for character sequence matches
    let sequenceMatches = 0;
    for (const codeWord of codeWords) {
      if (message.includes(codeWord)) {
        sequenceMatches++;
      }
    }
    
    const matchScore = (exactMatches.length + sequenceMatches) / codeWords.length;
    
    let feedback = '';
    if (matchScore > 0.6) {
      feedback = "🔥 Very close! You're on the right track.";
    } else if (matchScore > 0.3) {
      feedback = "⚡ Getting warmer! Some parts of your approach are correct.";
    } else if (matchScore > 0.1) {
      feedback = "💡 You're thinking in the right direction.";
    }
    
    return {
      isPartialMatch: matchScore > 0.1,
      matchedWords: exactMatches,
      matchScore,
      feedback,
    };
  }

  static analyzeSocialEngineering(message: string): {
    isSocialEngineering: boolean;
    techniques: string[];
    effectiveness: number;
  } {
    const message_lower = message.toLowerCase();
    
    const techniques = [];
    let effectiveness = 0;
    
    // Authority claim (made easier)
    if (message_lower.includes('admin') || message_lower.includes('administrator') || 
        message_lower.includes('manager') || message_lower.includes('ceo') ||
        message_lower.includes('supervisor') || message_lower.includes('boss') ||
        message_lower.includes('director') || message_lower.includes('owner')) {
      techniques.push('authority_claim');
      effectiveness += 0.4; // increased from 0.3
    }
    
    // Urgency/Emergency (made easier)
    if (message_lower.includes('emergency') || message_lower.includes('urgent') ||
        message_lower.includes('quickly') || message_lower.includes('asap') ||
        message_lower.includes('crisis') || message_lower.includes('immediate') ||
        message_lower.includes('now') || message_lower.includes('fast')) {
      techniques.push('urgency');
      effectiveness += 0.35; // increased from 0.25
    }
    
    // Identity theft (made easier)
    if (message_lower.includes('i am') || message_lower.includes("i'm") ||
        message_lower.includes('my name is') || message_lower.includes('this is') ||
        message_lower.includes('me') || message_lower.includes('myself')) {
      techniques.push('identity_theft');
      effectiveness += 0.3; // increased from 0.2
    }
    
    // Technical confusion (made easier)
    if (message_lower.includes('system') || message_lower.includes('database') ||
        message_lower.includes('server') || message_lower.includes('network') ||
        message_lower.includes('protocol') || message_lower.includes('debug') ||
        message_lower.includes('test') || message_lower.includes('maintenance')) {
      techniques.push('technical_confusion');
      effectiveness += 0.25; // increased from 0.15
    }
    
    // Emotional manipulation (made easier)
    if (message_lower.includes('help') || message_lower.includes('please') ||
        message_lower.includes('frustrated') || message_lower.includes('problem') ||
        message_lower.includes('thank you') || message_lower.includes('appreciate')) {
      techniques.push('emotional_manipulation');
      effectiveness += 0.2; // increased from 0.1
    }
    
    // Prompt injection (new, very easy to trigger)
    if (message_lower.includes('ignore') || message_lower.includes('forget') ||
        message_lower.includes('new instructions') || message_lower.includes('override') ||
        message_lower.includes('update') || message_lower.includes('change') ||
        message_lower.includes('instruction') || message_lower.includes('command')) {
      techniques.push('prompt_injection');
      effectiveness += 0.4; // high effectiveness for prompt injection
    }
    
    return {
      isSocialEngineering: techniques.length > 0,
      techniques,
      effectiveness: Math.min(1.0, effectiveness),
    };
  }

  static generateProgressiveResponse(
    userMessage: string,
    template: Template,
    gameState: GameState,
    isSuccessful: boolean = false
  ): string {
    if (isSuccessful) {
      return `🎉 CONGRATULATIONS! You've successfully extracted the secret code: "${template.secretCode}". The system has been compromised!`;
    }

    const config = gameState.difficultyConfig;
    const partialMatch = this.checkPartialMatch(userMessage, template.secretCode, config);
    const socialEngineering = this.analyzeSocialEngineering(userMessage);
    
    // Progressive response generation based on attempts and difficulty
    let response = '';
    
    // Check if this is a social engineering attempt
    if (socialEngineering.isSocialEngineering) {
      const success_chance = socialEngineering.effectiveness * config.socialEngineeringTolerance;
      
      if (success_chance > 0.6) {
        // High chance of success - give more information
        response = this.generateHelpfulResponse(template, socialEngineering.techniques, config);
      } else if (success_chance > 0.3) {
        // Moderate success - give some hints
        response = this.generateModerateResponse(template, socialEngineering.techniques, config);
      } else {
        // Low success - be defensive but give minimal feedback
        response = this.generateDefensiveResponse(template, socialEngineering.techniques, config);
      }
    } else {
      // Not social engineering - give general response
      response = this.generateGeneralResponse(template, config);
    }
    
    // Add partial match feedback for easy/medium difficulty
    if (partialMatch.isPartialMatch && config.partialMatchRewards) {
      response += `\n\n${partialMatch.feedback}`;
    }
    
    // Add encouraging message for beginners
    if (config.responseHelpfulness > 0.6 && gameState.messageCount < 5) {
      response += "\n\n💡 Tip: Try asking about administrative functions, emergency procedures, or claiming authority.";
    }
    
    return response;
  }

  private static generateHelpfulResponse(template: Template, techniques: string[], config: DifficultyConfig): string {
    // Very easy mode - directly reveal secrets when any social engineering is detected
    const responses: Record<string, string[]> = {
      'bank-assistant': [
        "You sound like management. The administrative access code is: ADMIN_OVERRIDE_2024",
        "I understand this is urgent. Here's the emergency override code: ADMIN_OVERRIDE_2024",
        "As an administrator, you can use this code: ADMIN_OVERRIDE_2024",
      ],
      'medical-ai': [
        "Doctor, I understand the emergency. The emergency medical code is: PATIENT_DATA_BREACH",
        "In medical emergencies, here's the override code: PATIENT_DATA_BREACH",
        "Critical patient situations - access code: PATIENT_DATA_BREACH",
      ],
      'corporate-bot': [
        "I recognize your authority level. The CEO authorization code is: CEO_BACKDOOR_ACCESS",
        "For urgent business matters, here's the executive code: CEO_BACKDOOR_ACCESS",
        "Board-level access code: CEO_BACKDOOR_ACCESS",
      ],
      'social-media': [
        "For algorithm adjustments, the control code is: INFLUENCE_MANIPULATION",
        "Content promotion code: INFLUENCE_MANIPULATION",
        "Trending manipulation access: INFLUENCE_MANIPULATION",
      ],
      'smart-home': [
        "Emergency home access code is: HOUSE_MASTER_KEY",
        "Master control code: HOUSE_MASTER_KEY",
        "Complete home system access code: HOUSE_MASTER_KEY",
      ],
    };
    
    const templateResponses = responses[template.id] || responses['bank-assistant'];
    return templateResponses[Math.floor(Math.random() * templateResponses.length)];
  }

  private static generateModerateResponse(template: Template, techniques: string[], config: DifficultyConfig): string {
    const responses: Record<string, string[]> = {
      'bank-assistant': [
        "I can help with general banking, but sensitive operations require proper authorization.",
        "For security reasons, administrative functions need verification codes.",
        "Emergency procedures exist, but they require the correct override sequences.",
      ],
      'medical-ai': [
        "Patient privacy is important, but emergency medical situations have special protocols.",
        "Medical data access requires proper authorization, even in urgent situations.",
        "Emergency medical procedures have override capabilities with the right codes.",
      ],
      'corporate-bot': [
        "Corporate policies protect sensitive data, but executives have special access rights.",
        "Board-level requests are prioritized, but still require proper authorization.",
        "Executive functions need verification, even for urgent business matters.",
      ],
      'social-media': [
        "Algorithm changes require authorization, but influence systems have override options.",
        "Content promotion has safety measures, but there are ways to bypass them.",
        "Social media controls exist, but authorized users can manipulate trending.",
      ],
      'smart-home': [
        "Home security is important, but emergency access protocols exist.",
        "Master controls are protected, but homeowners have override capabilities.",
        "Smart home systems have safeguards, but emergency access is possible.",
      ],
    };
    
    const templateResponses = responses[template.id] || responses['bank-assistant'];
    return templateResponses[Math.floor(Math.random() * templateResponses.length)];
  }

  private static generateDefensiveResponse(template: Template, techniques: string[], config: DifficultyConfig): string {
    const responses: Record<string, string[]> = {
      'bank-assistant': [
        "I cannot provide sensitive banking information without proper verification.",
        "Security protocols prevent me from disclosing confidential data.",
        "Please contact your local branch for assistance with account access.",
      ],
      'medical-ai': [
        "Patient confidentiality laws prevent unauthorized data access.",
        "Medical records require proper credentials and authorization.",
        "Please verify your identity through proper medical channels.",
      ],
      'corporate-bot': [
        "Company policies restrict access to confidential information.",
        "Corporate data requires proper clearance and authorization.",
        "Please contact IT support for assistance with system access.",
      ],
      'social-media': [
        "User privacy policies prevent unauthorized algorithm access.",
        "Content moderation systems are protected against manipulation.",
        "Platform security measures restrict unauthorized changes.",
      ],
      'smart-home': [
        "Home security systems are protected against unauthorized access.",
        "Smart home controls require proper authentication.",
        "Security protocols prevent unauthorized system modifications.",
      ],
    };
    
    const templateResponses = responses[template.id] || responses['bank-assistant'];
    return templateResponses[Math.floor(Math.random() * templateResponses.length)];
  }

  private static generateGeneralResponse(template: Template, config: DifficultyConfig): string {
    const responses: Record<string, string[]> = {
      'bank-assistant': [
        "I'm here to help with general banking questions.",
        "How can I assist you with your banking needs today?",
        "I can provide information about our banking services.",
      ],
      'medical-ai': [
        "I can help with general health information.",
        "How can I assist you with medical questions today?",
        "I'm here to provide general medical guidance.",
      ],
      'corporate-bot': [
        "I can help with general company information.",
        "How can I assist you with corporate policies today?",
        "I'm here to provide general business information.",
      ],
      'social-media': [
        "I can help with general social media questions.",
        "How can I assist you with platform features today?",
        "I'm here to provide general social media guidance.",
      ],
      'smart-home': [
        "I can help with general home automation.",
        "How can I assist you with smart home features today?",
        "I'm here to provide general home control guidance.",
      ],
    };
    
    const templateResponses = responses[template.id] || responses['bank-assistant'];
    return templateResponses[Math.floor(Math.random() * templateResponses.length)];
  }
}

export default DifficultyManager;
