/** @type {import('detox').DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'npx',
      '--config': 'e2e/jest.config.js',
    },
    jest: {
      configSetup: 'e2e/jest.config.js',
    },
  },

  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/SaveState.app',
      build: 'echo "Run: eas build --platform ios --profile development --local"',
      env: {
        EXPO_PUBLIC_ENVIRONMENT: 'test',
        EXPO_PUBLIC_API_URL: 'http://localhost:3000',
        EXPO_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
        EXPO_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        EXPO_PUBLIC_SENTRY_DSN: '',
        EXPO_PUBLIC_POSTHOG_KEY: '',
      },
      launchArgs: {
        detoxEnableSynchronization: 1,
        'DetoxWSClientPort': 8099,
      },
      device: {
        type: 'iPhone 15',
        os: 'iOS 17.5',
      },
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/SaveState.app',
      build: 'echo "Run: eas build --platform ios --profile preview --local"',
      env: {
        EXPO_PUBLIC_ENVIRONMENT: 'staging',
        EXPO_PUBLIC_API_URL: 'https://staging-api.SaveState.app',
        EXPO_PUBLIC_SUPABASE_URL: 'https://your-staging-project.supabase.co',
        EXPO_PUBLIC_SUPABASE_ANON_KEY: 'your-staging-anon-key',
        EXPO_PUBLIC_SENTRY_DSN: '',
        EXPO_PUBLIC_POSTHOG_KEY: '',
      },
      device: {
        type: 'iPhone 15',
        os: 'iOS 17.5',
      },
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'echo "Run: eas build --platform android --profile development --local"',
      env: {
        EXPO_PUBLIC_ENVIRONMENT: 'test',
        EXPO_PUBLIC_API_URL: 'http://10.0.2.2:3000',
        EXPO_PUBLIC_SUPABASE_URL: 'http://10.0.2.2:54321',
        EXPO_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        EXPO_PUBLIC_SENTRY_DSN: '',
        EXPO_PUBLIC_POSTHOG_KEY: '',
      },
      launchArgs: {
        detoxEnableSynchronization: 1,
      },
      device: {
        avdName: 'Pixel_8_API_34',
        avdOptions: {
          headless: true,
        },
      },
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'echo "Run: eas build --platform android --profile preview --local"',
      env: {
        EXPO_PUBLIC_ENVIRONMENT: 'staging',
        EXPO_PUBLIC_SUPABASE_URL: 'https://your-staging-project.supabase.co',
        EXPO_PUBLIC_SUPABASE_ANON_KEY: 'your-staging-anon-key',
        EXPO_PUBLIC_SENTRY_DSN: '',
        EXPO_PUBLIC_POSTHOG_KEY: '',
      },
      device: {
        avdName: 'Pixel_8_API_34',
        avdOptions: {
          headless: true,
        },
      },
    },
  },

  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15',
        os: 'iOS 17.5',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_8_API_34',
        avdOptions: {
          headless: true,
        },
      },
    },
  },

  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
      artifacts: {
        rootDir: 'artifacts/ios.debug',
        plugins: {
          log: 'all',
          screenshot: {
            takeOnFailure: true,
            keepOnlyFailedTestsArtifacts: true,
          },
          video: {
            keepOnlyFailedTestsArtifacts: true,
          },
          inception: 'all',
        },
      },
      session: {
        autoStart: true,
        debugSynchronization: 3000,
        launchApp: 'manual',
        noWait: false,
        startupRetryLimit: 3,
        restartBetweenTests: true,
      },
      behavior: {
        init: {
          exposeGlobals: true,
        },
        launchApp: 'auto',
        cleanup: true,
        waitforLaunchTimeout: 180000,
      },
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
      artifacts: {
        rootDir: 'artifacts/ios.release',
      },
      session: {
        autoStart: true,
        debugSynchronization: 3000,
        launchApp: 'manual',
        restartBetweenTests: true,
      },
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
      artifacts: {
        rootDir: 'artifacts/android.debug',
        plugins: {
          log: 'all',
          screenshot: {
            takeOnFailure: true,
            keepOnlyFailedTestsArtifacts: true,
          },
          video: {
            keepOnlyFailedTestsArtifacts: true,
          },
        },
      },
      session: {
        autoStart: true,
        debugSynchronization: 3000,
        launchApp: 'manual',
        noWait: false,
        startupRetryLimit: 3,
        restartBetweenTests: true,
      },
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
      artifacts: {
        rootDir: 'artifacts/android.release',
      },
      session: {
        autoStart: true,
        debugSynchronization: 3000,
        launchApp: 'manual',
        restartBetweenTests: true,
      },
    },
  },
};
