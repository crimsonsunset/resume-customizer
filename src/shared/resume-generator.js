import fs from 'node:fs';
import { formatISO } from 'date-fns';

/**
 * Resume generator that creates different versions from profile.json
 * @class ResumeGenerator
 */
class ResumeGenerator {
  constructor(profilePath) {
    this.profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
  }

  /**
   * Generate a specific resume version
   * @param {string} version - Version name from resume_config.versions
   * @returns {object} Generated resume data
   */
  generateResume(version = 'full') {
    const config = this.profile.resume_config.versions[version];
    if (!config) {
      throw new Error(`Resume version "${version}" not found`);
    }

    const resume = {
      meta: {
        version,
        generated_at: formatISO(new Date()),
        config
      },
      basic_info: this.generateBasicInfo(config),
      sections: {}
    };

    // Generate sections based on config order
    for (const section of config.section_order) {
      switch (section) {
        case 'education': {
          resume.sections.education = this.generateEducation(config);
          break;
        }
        case 'experience': {
          resume.sections.experience = this.generateExperience(config);
          break;
        }
        case 'projects': {
          resume.sections.projects = this.generateProjects(config);
          break;
        }
        case 'skills': {
          resume.sections.skills = this.generateSkills(config);
          break;
        }
        case 'summary': {
          resume.sections.summary = this.generateSummary(config);
          break;
        }
      }
    }

    return resume;
  }

  /**
   * Generate basic info section
   */
  generateBasicInfo(_config) {
    const { name, headline, location, contact } = this.profile.basic_info;
    return {
      name,
      headline,
      location,
      email: contact.email,
      phone: contact.phone,
      linkedin: contact.linkedin,
      website: contact.website
    };
  }

  /**
   * Generate summary section based on config
   */
  generateSummary(config) {
    let {summary} = this.profile.basic_info;
    
    // Apply targeting if specified
    if (this.profile.job_targeting?.current_target) {
      const target = this.profile.job_targeting.current_target;
      if (target.customizations?.summary_focus) {
        // In a real implementation, this would use AI/NLP to rewrite
        summary = `${summary} [Emphasized: ${target.customizations.summary_focus}]`;
      }
    }

    return {
      content: summary,
      style: config.style || 'paragraph'
    };
  }

  /**
   * Generate experience section with filtering and prioritization
   */
  generateExperience(config) {
    let experiences = [...this.profile.experience];

    // Apply version-specific filtering
    if (config.experience_filter === 'management_roles_only') {
      experiences = experiences.filter(exp => 
        exp.title.toLowerCase().includes('manager') || 
        exp.title.toLowerCase().includes('director') ||
        exp.title.toLowerCase().includes('lead')
      );
    }

    // Apply experience limit
    if (config.experience_limit) {
      experiences = experiences.slice(0, config.experience_limit);
    }

    // Process each experience
    return experiences.map(exp => {
      const processedExp = {
        title: exp.title,
        company: exp.company,
        duration: exp.duration,
        description: exp.description,
        bulletPoints: exp.bulletPoints,
        skills: exp.skills
      };

      // Apply bullet point filtering for short versions
      if (exp.resume_metadata?.short_version_bullets && config.target_length === '1_page') {
        processedExp.bulletPoints = exp.resume_metadata.short_version_bullets.map(
          index => exp.bulletPoints[index]
        );
      }

      return processedExp;
    });
  }

  /**
   * Generate projects section
   */
  generateProjects(config) {
    let projects = [...this.profile.projects];

    // Apply project limit
    if (config.projects_limit) {
      projects = projects.slice(0, config.projects_limit);
    }

    // Filter by version inclusion
    projects = projects.filter(project => {
      if (!project.resume_metadata?.show_in_versions) return true;
      return project.resume_metadata.show_in_versions.includes(config.name?.toLowerCase());
    });

    return projects.map(project => ({
      name: project.name,
      company: project.company,
      date: project.date,
      description: project.description,
      bulletPoints: project.bulletPoints,
      skills: project.skills,
      url: project.url
    }));
  }

  /**
   * Generate education section
   */
  generateEducation(_config) {
    return this.profile.education.map(edu => ({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      dates: edu.dates,
      description: edu.description,
      activities: edu.activities
    }));
  }

  /**
   * Generate skills section with filtering and categorization
   */
  generateSkills(config) {
    let skills = [...this.profile.skills];

    // Filter by version inclusion
    if (config.filter_skills) {
      skills = skills.filter(skill => 
        config.filter_skills.includes(skill.name)
      );
    }

    // Filter by resume metadata
    skills = skills.filter(skill => {
      if (!skill.resume_metadata?.show_in_versions) return true;
      return skill.resume_metadata.show_in_versions.includes(config.name?.toLowerCase());
    });

    // Sort by priority and endorsements
    skills.sort((a, b) => {
      const aPriority = a.resume_metadata?.priority === 'high' ? 3 : 
                       a.resume_metadata?.priority === 'medium' ? 2 : 1;
      const bPriority = b.resume_metadata?.priority === 'high' ? 3 : 
                       b.resume_metadata?.priority === 'medium' ? 2 : 1;
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.endorsements - a.endorsements;
    });

    return skills.map(skill => ({
      name: skill.name,
      endorsements: skill.endorsements,
      category: skill.resume_metadata?.category || 'general',
      proficiency: skill.resume_metadata?.proficiency,
      years_experience: skill.resume_metadata?.years_experience
    }));
  }

  /**
   * Generate HTML resume from resume data
   */
  generateHTML(resumeData, templateName = 'modern') {
    const template = this.profile.resume_templates[templateName];
    if (!template) {
      throw new Error(`Template "${templateName}" not found`);
    }

    // This would contain the HTML generation logic
    // For now, just return a basic structure
    return `
      <html>
        <head>
          <title>${resumeData.basic_info.name} - Resume</title>
          <style>
            /* Template-specific styles would go here */
          </style>
        </head>
        <body>
          <h1>${resumeData.basic_info.name}</h1>
          <p>${resumeData.basic_info.headline}</p>
          <!-- Full HTML generation would be implemented here -->
        </body>
      </html>
    `;
  }
}

// Example usage (only when running file directly, not when bundled)
if (import.meta.url === `file://${process.argv[1]}` && import.meta.url.includes('src/shared/resume-generator.js')) {
  const generator = new ResumeGenerator('input/profiles/profile.json');
  
  // Generate different versions
  const fullResume = generator.generateResume('full');
  const shortResume = generator.generateResume('short');
  const technicalResume = generator.generateResume('technical');
  
  console.log('Generated resume versions:');
  console.log('- Full resume:', fullResume.sections.experience.length, 'experiences');
  console.log('- Short resume:', shortResume.sections.experience.length, 'experiences');
  console.log('- Technical resume:', technicalResume.sections.skills.length, 'skills');
}

export default ResumeGenerator; 