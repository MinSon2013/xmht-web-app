import { forwardRef, Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { DeleteResult, UpdateResult } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { ReportRepository } from './repository/report.repository';
import { Reports } from './entities/report.entity';
import { ModifyReportDTO } from './dto/modify-report.dto';
import { NotificationService } from '../notification/notification.service';
import { SearchDTO } from './dto/search.dto';
import { USER_AREA_MANAGER } from '../config/constant';

@Injectable()
export class ReportService {
    constructor(
        public readonly reportRepo: ReportRepository,
        private readonly userService: UserService,
        @Inject(forwardRef(() => AuthService))
        private readonly notificationService: NotificationService,
    ) { }

    async findAll(userId: number, searchDto?: SearchDTO): Promise<Reports[]> {
        const userEntity = await this.userService.getOne(userId);
        if (userEntity) {
            let sql = this.reportRepo.createQueryBuilder()
                .orderBy("STR_TO_DATE(update_date, \'%H:%i:%s %d/%m/%Y\')", "DESC")
                .groupBy("update_date")
                .addGroupBy("district_id")
                .addGroupBy("province_id")
                .addGroupBy("id")
                .where("1 = 1");

            if (userEntity.role === USER_AREA_MANAGER) {
                const districtIds = await this.userService.getDistrictByUserId(userId);
                if (districtIds.length > 0) {
                    sql = sql.andWhere("district_id IN (:districtIds)", { districtIds });
                }
            }

            if (searchDto) {
                if (searchDto.date.length > 0) {
                    searchDto.date = '%' + searchDto.date;
                    sql = sql.andWhere("update_date LIKE :updateDate", { updateDate: searchDto.date });
                }
                if (searchDto.districtId !== 0) {
                    sql = sql.andWhere("district_id = :districtId", { districtId: searchDto.districtId });
                }
            }

            return await sql.getMany();
        } else {
            return [];
        }

    }

    async findOne(id: number): Promise<Reports> {
        return await this.reportRepo.getOne(id);
    }

    async create(modifyReportDto: ModifyReportDTO): Promise<Reports> {
        return await this.reportRepo.createReport(modifyReportDto, this.notificationService);
    }

    async update(modifyReportDto: ModifyReportDTO): Promise<UpdateResult> {
        return await this.reportRepo.updateReport(modifyReportDto, this.notificationService);
    }

    async delete(id: number): Promise<DeleteResult> {
        return await this.reportRepo.deleteReport(id);
    }


    async uploadFile(reportId: number, file: { path, filename, mimetype }): Promise<Reports | any> {
        const res = await this.reportRepo.createQueryBuilder()
            .update(Reports)
            .set({ filePath: file.path, attachFile: file.filename, mimeType: file.mimetype })
            .where("id = :id", { id: reportId })
            .execute();
        if (res.affected > 0) {
            return { statusCode: 200 };
        }
        return { statusCode: 400 };
    }

    async getFileById(id: number) {
        const row = await this.reportRepo.findOne({
            where: { id }
        });
        if (!row) {
            throw new NotFoundException();
        }
        return row;
    }

    async search(searchDto: SearchDTO): Promise<Reports[]> {
        return await this.findAll(searchDto.userId, searchDto);
    }
}
