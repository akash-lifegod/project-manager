import mongoose, { Schema} from 'mongoose';

const workspaceModel = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        color: {
            type: String,
            required: true,
            default: '#FF5733',
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [
            {
                user: {
                    type: Schema.Types.ObjectId, 
                    ref: 'User'
                },
                role: {
                    type: String,
                    enum: ['admin', 'member', 'owner', 'viewer'],
                    default: 'member',
                },
                joinedAt: {
                    type: Date,
                    default: Date.now,
                },
            }
        ],
        projects: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Project',
            }
        ],

    },
    {
        timestamps: true
    }
);

const Workspace = mongoose.model('Workspace', workspaceModel);

export default Workspace;