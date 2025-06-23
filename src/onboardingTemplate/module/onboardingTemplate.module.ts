import { Controller, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {onboardingTemplate} from '../../allEntities/OnboardingTemplate.entity'
import {onboardingController } from '../controller/onboardingTemplate.controller'
import {onboardingTemplateService} from '../service/onboardingTemplate.service'
import { S3Module } from '../../s3/module/module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            onboardingTemplate
        ]),
        S3Module,
    ],
    controllers: [onboardingController],
    providers:[onboardingTemplateService]
})
export class onboardingTemplateModule {}
