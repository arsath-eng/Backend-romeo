import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class accessLevels {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accessLevelName: string;

  @Column()
  accessLevelType: string;

  @Column('json')
  access: {
    "personal": {
        "profile": {
            "access": boolean
        },
        "profile_img": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "personal": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "job": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "documents": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "notes": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "emergency": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "performance": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "training": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "onboarding": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "offboarding": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "payroll": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "claims": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "roster": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "timesheet": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "survey": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        }
    },
    "team": {
        "profile": {
            "all": boolean,
            "under": boolean,
            "none": boolean
        },
        "profile_img": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "personal": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "job": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "documents": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "notes": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "emergency": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "performance": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "training": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "onboarding": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "offboarding": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "payroll": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "claims": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "roster": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "timesheet": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "survey": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        }
    },
    "features": {
        "leaves": {
            "category": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "balance": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "holiday": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            }
        },
        "survey": {
            "templates": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "surveys": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            }
        },
        "hiring": {
            "job": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "candidates": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "talentPool": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            }
        },
        "onboarding": {
            "templates": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "tasks": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            }
        },
        "offboarding": {
            "templates": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "tasks": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            }
        },
        "project": {
            "project": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "timesheet": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            }
        },
        "rostering": {
            "sites": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "positions": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "staff": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "templates": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "roster": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            }
        },
        "attendance": {
            "summary": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            }
        },
        "settings": {
            "general": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "companySettings": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "accessLevels": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "plans": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "customerSupport": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            }
        },
        "files": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "claims": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "assets": {
            "edit": boolean,
            "delete": boolean,
            "view": boolean,
            "all": boolean
        },
        "payroll": {
            "payrun": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "payItemSettings": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "payPeriodSettings": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "payTemplates": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            }
        },
        "training": {
            "settings": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            },
            "tasks": {
                "edit": boolean,
                "delete": boolean,
                "view": boolean,
                "all": boolean
            }
        }
    },
    "approval": {
        "leaves": {
            "all": boolean,
            "team": boolean,
            "none": boolean
        },
        "claims": {
            "all": boolean,
            "team": boolean,
            "none": boolean
        },
        "information": {
            "all": boolean,
            "team": boolean,
            "none": boolean
        },
        "assets": {
            "all": boolean,
            "team": boolean,
            "none": boolean
        },
        "timesheet": {
            "all": boolean,
            "team": boolean,
            "none": boolean
        }
    }
  };
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @Column()
  companyId: string;
}

